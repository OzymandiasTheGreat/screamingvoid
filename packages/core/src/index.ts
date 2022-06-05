import { Buffer } from "buffer";
import Corestore from "corestore";
import { EventEmitter2, Listener, ListenerFn } from "eventemitter2";
import { mkdir } from "fs/promises";
import HyperBee from "hyperbee";
import Hyperswarm from "hyperswarm";
import leveldown from "leveldown";
import levelup from "levelup";
import path from "path";
import sodium from "sodium-universal";
import sub from "subleveldown";
import {
	CONVO_INPUT,
	CONVO_REQUEST,
	VOID_PEER_AVATAR,
	VOID_PEER_BIO,
	VOID_PEER_NAME,
	VOID_VERSION,
} from "./constants";
import { VoidConversation } from "./conversation";
import { ConvoNotFound, IdentityNotFound } from "./errors";
import { VoidPeer } from "./peer";
import {
	ChatMessage,
	ConversationInput,
	ConversationMeta,
	ConversationPeer,
	ConversationRequest,
} from "./proto/conversation";
import { CachedPeer } from "./proto/peer";
import { Purpose, VersionTag } from "./proto/version";
import { KeyPair, Peer } from "./types";
import { Defered, hash, seal, uriToImage } from "./util";

export class VoidIdentity extends EventEmitter2 {
	id: string;
	keyPair: KeyPair;
	boxKeyPair: KeyPair;

	prefix: string;
	ready: Promise<void>;

	corestore: Corestore;
	feed: HyperBee;

	swarm!: Hyperswarm;
	private _swarmReady: Defered<void>;

	storage!: levelup.LevelUp;
	private _storageReady: Defered<void>;

	peers: Map<string, VoidPeer> = new Map();
	peerCache!: levelup.LevelUp;

	// TODO contact stuff

	convoStore!: levelup.LevelUp;
	convoMeta!: levelup.LevelUp;
	conversations: Map<string, VoidConversation> = new Map();

	directConnections: Set<string> = new Set();

	constructor(prefix: string, keyPair: KeyPair) {
		super({ wildcard: true });

		this.prefix = prefix;
		this.id = keyPair.publicKey.toString("hex");
		this.keyPair = keyPair;
		this.boxKeyPair = {
			publicKey: Buffer.allocUnsafe(sodium.crypto_box_PUBLICKEYBYTES),
			secretKey: Buffer.allocUnsafe(sodium.crypto_box_SECRETKEYBYTES),
		};
		sodium.crypto_sign_ed25519_pk_to_curve25519(
			this.boxKeyPair.publicKey,
			keyPair.publicKey,
		);
		sodium.crypto_sign_ed25519_sk_to_curve25519(
			this.boxKeyPair.secretKey,
			keyPair.secretKey,
		);

		this.corestore = new Corestore(path.join(prefix, this.id, "shared"));
		this.feed = new HyperBee(this.corestore.get({ keyPair }));
		this._storageReady = new Defered();
		this._swarmReady = new Defered();

		this.ready = Promise.all([
			this._storageReady.promise,
			this._swarmReady.promise,
		]).then(() => {});
	}

	on(
		event: ["peer", "connect"],
		listener: (publicKey: Buffer) => void,
	): Listener;
	on(
		event: ["peer", "disconnect"],
		listener: (publicKey: Buffer) => void,
	): Listener;
	on(
		event: ["peer", "avatar"],
		listener: (data: { publicKey: Buffer; avatar: string }) => void,
	): Listener;
	on(
		event: ["peer", "error"],
		listener: (data: { publicKey: Buffer; error: Error }) => void,
	): Listener;
	on(
		event: ["conversation", "rename"],
		listener: (data: { id: Buffer; name: string }) => void,
	): Listener;
	on(
		event: ["conversation", "request"],
		listener: (data: {
			id: Buffer;
			name: string;
			peers: { publicKey: string; name?: string; bio?: string };
		}) => void,
	): Listener;
	on(
		event: ["conversation", "message"],
		listener: (data: {
			conversation: Buffer;
			message: ChatMessage;
			replyTo: Buffer;
		}) => void,
	): Listener;
	on(
		event: ["conversation", "remove"],
		listener: (data: { conversation: Buffer; message: Buffer }) => void,
	): Listener;
	on(
		event: ["conversation", "react"],
		listener: (data: {
			conversation: Buffer;
			target: Buffer;
			replyTo: Buffer;
		}) => void,
	): Listener;
	on(event: string | string[], listener: ListenerFn): Listener {
		return super.on(event, listener, { objectify: true }) as Listener;
	}

	private async openStorage(prefix: string) {
		const storagePath = path.join(prefix, this.id, "storage");
		await mkdir(storagePath, { recursive: true });
		await new Promise<void>((resolve, reject) => {
			this.storage = levelup(leveldown(storagePath), (err: Error) => {
				if (err) {
					this._storageReady.reject(err);
					return reject(err);
				}
				resolve();
			});
		});
		this.peerCache = sub(this.storage, "VOID_PEER_CACHE", {
			keyEncoding: "binary",
			valueEncoding: CachedPeer as any,
		});
		// TODO contact stuff
		this.convoMeta = sub(this.storage, "VOID_CONVERSATION_META", {
			keyEncoding: "binary",
			valueEncoding: ConversationMeta as any,
		});
		this.convoStore = sub(this.storage, "VOID_CONVERSATION_INPUT", {
			keyEncoding: "binary",
			valueEncoding: ConversationInput as any,
		});
		for await (let [key, meta] of this.convoMeta.iterator() as any) {
			if (!(meta as ConversationMeta).muted) {
				const input: ConversationInput = await this.convoStore
					.get(key)
					.catch(() => null);
				if (input) {
					const local = input.peers[this.id];
					const convo = await VoidConversation.open(
						key,
						meta,
						local,
						this,
					);
					this.conversations.set(key.toString("hex"), convo);
					convo.onAny((e, ...args) => this.emit(e, ...args));
					for (let peer of Object.keys(input.peers)) {
						this.directConnections.add(peer);
					}
				} else {
					console.error(
						`No inputs found for conversation "${
							meta.name
						}", "${key.toString("hex")}"`,
					);
				}
			}
		}
		this.convoMeta.on(
			"put",
			async (key: Buffer, meta: ConversationMeta) => {
				if (!meta.muted) {
					const input: ConversationInput = await this.convoStore
						.get(key)
						.catch(() => null);
					if (input) {
						const local = input.peers[this.id];
						const convo = await VoidConversation.open(
							key,
							meta,
							local,
							this,
						);
						this.conversations.set(key.toString("hex"), convo);
						convo.onAny((e, ...args) => this.emit(e, ...args));
						for (let peer of Object.keys(input.peers)) {
							this.directConnections.add(peer);
						}
					} else {
						console.error(
							`No inputs found for conversation "${
								meta.name
							}", "${key.toString("hex")}"`,
						);
					}
				} else {
					// TODO Unload convo
				}
			},
		);
		this._storageReady.resolve();
	}

	private get maxPeers(): number {
		return Math.max(64, this.directConnections.size + 32);
	}

	private connect() {
		this.swarm = new Hyperswarm({
			keyPair: this.keyPair,
			maxPeers: this.maxPeers,
		});
		this.swarm.on("connection", async (socket, info) => {
			const peer = await VoidPeer.open(socket, info, this);
			peer.on(["peer", "disconnect"], (publicKey: Buffer) =>
				this.peers.delete(publicKey.toString("hex")),
			);
			peer.on(
				["conversation", "rename"],
				async ({ id, name }: { id: Buffer; name: string }) => {
					const meta: ConversationMeta = await this.convoMeta
						.get(id)
						.catch(() => null);
					const convo: ConversationInput = await this.convoStore
						.get(id)
						.catch(() => null);
					if (convo) {
						await this.convoStore.put(id, { ...convo, name });
					}
					if (meta) {
						await this.convoMeta.put(id, { ...meta, name });
						this.emit(["conversation", "rename"], { id, name });
					}
				},
			);
			peer.on(
				["conversation", "request"],
				async ({
					id,
					name,
					peers,
				}: {
					id: Buffer;
					name: string;
					peers: Buffer[];
				}) => {
					const peerPromises: Promise<Peer>[] = [];
					const convo: ConversationInput = { name, peers: {} };
					for (let peer of peers) {
						if (!this.keyPair.publicKey.equals(peer)) {
							peerPromises.push(
								this.lookup(peer)
									.catch((err) => {
										console.error(err);
										return this.lookup(peer);
									})
									.catch((err) => {
										console.error(err);
										return {
											publicKey: peer.toString("hex"),
										} as Peer;
									}),
							);
							convo.peers[peer.toString("hex")] = null as any;
						}
					}
					await this.convoStore.put(id, convo);
					this.renameConversation(id, name);
					const participants = await Promise.all(peerPromises);
					console.log({
						id: id.toString("hex"),
						name,
						peers: participants.map((p) => p.name || p.publicKey),
					});
					this.emit(["conversation", "request"], {
						id,
						name,
						peers: participants,
					});
				},
			);
			peer.onAny((e, ...args) => {
				if ((e as string).startsWith("peer.")) {
					this.emit(e, ...args);
				}
			});
			this.peers.set(peer.peerId, peer);
		});
		// TODO Join topics
		for (let id of this.directConnections) {
			this.swarm.joinPeer(Buffer.from(id, "hex"));
		}
		return this.swarm.listen().then(this._swarmReady.resolve);
	}

	private ensureJoin(publicKey: Buffer) {
		if (this.swarm.connections.size >= this.swarm.maxPeers) {
			this.swarm.maxPeers = this.swarm.connections.size + 1;
		}
		return this.swarm.joinPeer(publicKey);
	}

	private async getPeer(
		publicKey: Buffer,
	): Promise<Omit<CachedPeer, "name" | "bio" | "profile">> {
		const cached: CachedPeer = await this.peerCache
			.get(publicKey)
			.catch(() => null);
		if (cached) {
			return cached;
		}
		const boxPublicKey = Buffer.allocUnsafe(
			sodium.crypto_box_PUBLICKEYBYTES,
		);
		const sharedSecret = Buffer.allocUnsafe(
			sodium.crypto_scalarmult_BYTES,
		);
		sodium.crypto_sign_ed25519_pk_to_curve25519(boxPublicKey, publicKey);
		sodium.crypto_scalarmult(
			sharedSecret,
			this.boxKeyPair.secretKey,
			boxPublicKey,
		);
		const hostId = hash(this.keyPair.publicKey, sharedSecret);
		return {
			publicKey,
			boxPublicKey,
			sharedSecret,
			hostId,
		};
	}

	static async create(
		prefix: string,
		keyPair: KeyPair,
		name: string,
		bio: string,
		avatar: string,
	): Promise<VoidIdentity> {
		const id = new VoidIdentity(prefix, keyPair);
		await id.openStorage(prefix);
		await id.feed.ready();
		await id.feed.put(VOID_PEER_NAME, Buffer.from(name));
		await id.feed.put(VOID_PEER_BIO, Buffer.from(bio));
		await id.feed.put(VOID_PEER_AVATAR, uriToImage(avatar));
		await id.feed.put(
			VOID_VERSION,
			VersionTag.encode({
				version: 0,
				purpose: Purpose.PEER,
				profile: Date.now(),
			}),
		);
		await id.connect();
		return id.ready.then(() => id);
	}

	static async open(
		prefix: string,
		keyPair: KeyPair,
	): Promise<VoidIdentity> {
		const id = new VoidIdentity(prefix, keyPair);
		await id.openStorage(prefix);
		await id.feed.ready();
		const tag = await id.feed.get(VOID_VERSION);
		if (!tag) {
			throw new IdentityNotFound();
		}
		await id.connect();
		return id.ready.then(() => id);
	}

	async lookup(publicKey: Buffer): Promise<Peer> {
		let cached: CachedPeer = await this.peerCache
			.get(publicKey)
			.catch(() => null);
		if (!cached) {
			const promise = this.waitFor(["peer", "connect"], {
				timeout: 3000,
				filter: (pk: Buffer) => publicKey.equals(pk),
			} as any);
			this.ensureJoin(publicKey);
			await promise;
			cached = await this.peerCache.get(publicKey);
		}
		return {
			publicKey: publicKey.toString("hex"),
			name: cached.name,
			bio: cached.bio,
		};
	}

	async startConversation(
		publicKeys: Buffer[],
		name: string,
	): Promise<Buffer> {
		if (!publicKeys.length || !name) {
			throw new Error("Invalid conversation");
		}
		const id = hash(
			Buffer.concat(
				[this.keyPair.publicKey, ...publicKeys].sort(Buffer.compare),
			),
			null,
			24,
		);
		const stored = await this.convoStore.get(id).catch(() => null);
		if (stored) {
			const meta = await this.convoMeta.get(id).catch(() => null);
			if (meta) {
				return id;
			}
			return this.acceptConversation(id).then(() => id);
		}
		const hex = id.toString("hex");
		const convo: ConversationInput = { name, peers: {} };
		const localInput = this.corestore.get({ name: `${hex}-INPUT` });
		const localStorage = this.corestore.get({ name: `${hex}-STORAGE` });
		await localInput.ready();
		await localStorage.ready();
		convo.peers[this.id] = {
			input: localInput.key,
			storage: localStorage.key,
		};
		for (let peer of publicKeys) {
			this.ensureJoin(peer);
			const cached = await this.getPeer(peer);
			const peerHash = hash(peer, cached.sharedSecret);
			const convoCipher = seal(id, cached.boxPublicKey);
			const requestKey = Buffer.concat([
				CONVO_REQUEST,
				peerHash,
				convoCipher,
			]);
			const request = ConversationRequest.encode({
				name: name,
				peers: [this.keyPair.publicKey, ...publicKeys],
			});
			await this.feed.put(
				requestKey,
				seal(request, cached.boxPublicKey),
			);
			const inputKey = Buffer.concat([
				CONVO_INPUT,
				peerHash,
				convoCipher,
			]);
			await this.feed.put(
				inputKey,
				seal(
					ConversationPeer.encode({
						input: localInput.key,
						storage: localStorage.key,
					}),
					cached.boxPublicKey,
				),
			);
			convo.peers[peer.toString("hex")] = null as any;
		}
		await this.convoStore.put(id, convo);
		await this.convoMeta.put(id, {
			name,
			archived: false,
			muted: false,
		} as ConversationMeta);
		return id;
	}

	async acceptConversation(id: Buffer) {
		const convo: ConversationInput = await this.convoStore
			.get(id)
			.catch(() => null);
		if (!convo) {
			throw new ConvoNotFound(id);
		}
		const hex = id.toString("hex");
		const localInput = this.corestore.get({
			name: `${hex}-INPUT`,
		});
		const localStorage = this.corestore.get({ name: `${hex}-STORAGE` });
		await localInput.ready();
		await localStorage.ready();
		const publicKeys = Object.keys(convo.peers).map((hex) =>
			Buffer.from(hex, "hex"),
		);
		for (let pk of publicKeys) {
			const cached = await this.getPeer(pk);
			const peerHash = hash(pk, cached.sharedSecret);
			const convoCipher = seal(id, cached.boxPublicKey);
			const requestKey = Buffer.concat([
				CONVO_REQUEST,
				peerHash,
				convoCipher,
			]);
			const request = ConversationRequest.encode({
				name: convo.name,
				peers: publicKeys,
			});
			await this.feed.put(
				requestKey,
				seal(request, cached.boxPublicKey),
			);
			const inputKey = Buffer.concat([
				CONVO_INPUT,
				peerHash,
				convoCipher,
			]);
			await this.feed.put(
				inputKey,
				seal(
					ConversationPeer.encode({
						input: localInput.key,
						storage: localStorage.key,
					}),
					cached.boxPublicKey,
				),
			);
		}
		convo.peers[this.id] = {
			input: localInput.key,
			storage: localStorage.key,
		};
		await this.convoStore.put(id, convo);
		await this.convoMeta.put(id, {
			name: convo.name,
			archived: false,
			muted: false,
		} as ConversationMeta);
	}

	async renameConversation(id: Buffer, name: string) {
		const convo: ConversationMeta = await this.convoMeta
			.get(id)
			.catch(() => null);
		if (convo && convo.name !== name) {
			const peers = (await this.convoStore.get(id)).peers;
			const publicKeys = Object.keys(peers).map((hex) =>
				Buffer.from(hex, "hex"),
			);
			for (let pk of publicKeys) {
				const cached = await this.getPeer(pk);
				const peerHash = hash(pk, cached.sharedSecret);
				const convoCipher = seal(id, cached.boxPublicKey);
				const requestKey = Buffer.concat([
					CONVO_REQUEST,
					peerHash,
					convoCipher,
				]);
				const request = ConversationRequest.encode({
					name: name,
					peers: publicKeys,
				});
				await this.feed.put(
					requestKey,
					seal(request, cached.boxPublicKey),
				);
			}
			await this.convoStore.put(id, {
				name,
				peers,
			} as ConversationInput);
			await this.convoMeta.put(id, {
				...convo,
				name,
			} as ConversationMeta);
			this.emit(["conversation", "rename"], { id, name });
		}
	}
}
