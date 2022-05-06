import { EncryptDown } from "@screamingvoid/encrypt-down";
import { Buffer } from "buffer";
import Corestore from "corestore";
import {
	event,
	EventEmitter2,
	Listener,
	ListenerFn,
	OnOptions,
} from "eventemitter2";
import { mkdir } from "fs/promises";
import HyperBee from "hyperbee";
import Hyperswarm from "hyperswarm";
import leveldown from "leveldown";
import levelup from "levelup";
import path from "path";
import sodium from "sodium-universal";
import sub from "subleveldown";
import {
	VOID_PEER_AVATAR,
	VOID_PEER_BIO,
	VOID_PEER_NAME,
	VOID_VERSION,
} from "./constants";
import { IdentityNotFound } from "./errors";
import { VoidPeer } from "./peer";
import { StoredConversation } from "./proto/conversation";
import { CachedPeer } from "./proto/peer";
import { Purpose, VersionTag } from "./proto/version";
import { KeyPair, Peer } from "./types";
import { Defered, uriToImage } from "./util";

export class VoidIdentity extends EventEmitter2 {
	id: string;
	keyPair: KeyPair;
	curveKeyPair: KeyPair;
	encryptionKey: Buffer;

	ready: Promise<void>;

	corestore: Corestore;
	feed: HyperBee;
	private _feedReady: Defered<void>;

	swarm!: Hyperswarm;
	private _swarmReady: Defered<void>;

	storage!: levelup.LevelUp;
	private _storageReady: Defered<void>;

	peers: Map<string, VoidPeer> = new Map();
	peerCache!: levelup.LevelUp;

	// contacts: Map<string, VoidContact> = new Map();
	contactStore!: levelup.LevelUp;

	// conversations: Map<string, VoidConversation> = new Map();
	conversationStore!: levelup.LevelUp;

	directConnections!: Set<string>;

	constructor(prefix: string, keyPair: KeyPair, encryptionKey: Buffer) {
		super({ wildcard: true });

		this.id = keyPair.publicKey.toString("hex");
		this.keyPair = keyPair;
		this.curveKeyPair = {
			publicKey: Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES),
			secretKey: Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES),
		};
		sodium.crypto_sign_ed25519_pk_to_curve25519(
			this.curveKeyPair.publicKey,
			keyPair.publicKey,
		);
		sodium.crypto_sign_ed25519_sk_to_curve25519(
			this.curveKeyPair.secretKey,
			keyPair.secretKey,
		);
		this.encryptionKey = encryptionKey;

		this.corestore = new Corestore(path.join(prefix, this.id, "shared"));
		this.feed = new HyperBee(
			this.corestore.get({ keyPair, encryptionKey }),
		);
		this._feedReady = new Defered();
		this.feed
			.ready()
			.then(this._feedReady.resolve)
			.catch(this._feedReady.reject);

		this._storageReady = new Defered();
		this._swarmReady = new Defered();

		this.ready = Promise.all([
			this._feedReady.promise,
			this._storageReady.promise,
			this._swarmReady.promise,
		]).then(() => {});
	}

	on(event: ["peer", "connect"], listener: (id: string) => void): Listener;
	on(
		event: ["peer", "disconnect"],
		listener: (id: string) => void,
	): Listener;
	on(
		event: ["peer", "avatar"],
		listener: (data: { publicKey: string; avatar: string }) => void,
	): Listener;
	on(event: string[], listener: ListenerFn): Listener {
		return super.on(event, listener, { objectify: true }) as Listener;
	}

	private async openStorage(prefix: string) {
		const storagePath = path.join(prefix, this.id, "storage");
		await mkdir(storagePath, { recursive: true });
		await new Promise<void>((resolve, reject) => {
			this.storage = levelup(
				new EncryptDown(leveldown(storagePath), this.encryptionKey),
				(err: Error) => {
					if (err) {
						this._storageReady.reject(err);
						return reject(err);
					}
					resolve();
				},
			);
		});
		this.peerCache = sub(this.storage, "VOID_PEER_CACHE", {
			keyEncoding: "binary",
			valueEncoding: CachedPeer as any,
		});
		this.contactStore = sub(
			this.storage,
			"VOID_CONTACTS" /** TODO Define contact */,
		);
		this.conversationStore = sub(this.storage, "VOID_CONVERSATIONS", {
			keyEncoding: "binary",
			valueEncoding: StoredConversation as any,
		});
		this._storageReady.resolve();
	}

	private async enumDirectConnections() {
		const connections = new Set<string>();
		for await (let [
			_,
			convo,
		] of this.conversationStore.iterator() as any) {
			for (let peer of Object.keys(
				(convo as StoredConversation).peers,
			)) {
				connections.add(peer);
			}
		}
		this.directConnections = connections;
	}

	private get maxPeers(): number {
		return Math.max(64, this.directConnections.size + 32);
	}

	private async connect() {
		await this.enumDirectConnections();
		this.conversationStore.on("put", () => this.enumDirectConnections());
		this.swarm = new Hyperswarm({
			keyPair: this.keyPair,
			maxPeers: this.maxPeers,
		});
		this.swarm.on("connection", async (socket, info) => {
			const peer = await VoidPeer.open(socket, info, this);
			peer.on("peer.disconnect", (id) => this.peers.delete(id));
			this.listenTo(peer as any, "*");
			this.peers.set(peer.id, peer);
		});
		// TODO Join stored topics
		for (let id of this.directConnections) {
			this.swarm.joinPeer(Buffer.from(id, "hex"));
		}
		return this.swarm.listen().then(this._swarmReady.resolve);
	}

	static async create(
		prefix: string,
		keyPair: KeyPair,
		encryptionKey: Buffer,
		name: string,
		bio: string,
		avatar: string,
	): Promise<VoidIdentity> {
		const id = new VoidIdentity(prefix, keyPair, encryptionKey);
		await id.openStorage(prefix);
		console.log("STORAGE OPEN");
		await id._feedReady.promise;
		console.log("FEED READY");
		await id.feed.put(VOID_PEER_NAME, Buffer.from(name));
		console.log("PUT NAME");
		await id.feed.put(VOID_PEER_BIO, Buffer.from(bio));
		console.log("PUT BIO");
		await id.feed.put(VOID_PEER_AVATAR, uriToImage(avatar));
		console.log("PUT AVATAR");
		console.log(
			// await id.feed.put(
			// 	VOID_VERSION,
			// 	VersionTag.encode({
			// 		version: 0,
			// 		purpose: Purpose.PEER,
			// 		profile: Date.now(),
			// 	}),
			// ),
			await id.feed.put(VOID_VERSION, "Hello, World!"),
		);
		console.log(
			await id.feed
				.get(VOID_PEER_NAME)
				.catch((err) => console.error(err)),
		);
		console.log("PUT VERSION");
		await id.connect();
		console.log("CONNECT");
		return id.ready.then(() => id);
	}

	static async open(
		prefix: string,
		keyPair: KeyPair,
		encryptionKey: Buffer,
	): Promise<VoidIdentity> {
		const id = new VoidIdentity(prefix, keyPair, encryptionKey);
		await id.openStorage(prefix);
		console.log("STORAGE OPEN");
		await id._feedReady.promise;
		console.log("FEED READY");
		const tag = await id.feed
			.get(VOID_VERSION)
			.catch((err) => console.log(err));
		console.log(tag);
		if (!tag) {
			throw new IdentityNotFound();
		}
		await id.connect();
		console.log("CONNECTED");
		return id.ready.then(() => id);
	}

	async lookup(publicKey: Buffer): Promise<Peer> {
		let cached: CachedPeer = await this.peerCache
			.get(publicKey)
			.catch(() => null);
		if (!cached) {
			const promise = this.waitFor(["peer", "connect"], {
				timeout: 750,
				filter: (id: string) => id === publicKey.toString("hex"),
			} as any);
			this.swarm.joinPeer(publicKey);
			await promise;
			cached = await this.peerCache.get(publicKey);
		}
		return {
			publicKey: publicKey.toString("hex"),
			name: cached.name,
			bio: cached.bio,
		};
	}
}
