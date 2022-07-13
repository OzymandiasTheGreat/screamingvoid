import { Buffer } from "buffer";
import { EventEmitter2 } from "eventemitter2";
import HyperBee from "hyperbee";
import type { PeerInfo } from "hyperswarm";
import multiplex, { Multiplex } from "multiplex";
import sodium from "sodium-universal";
import type { Duplex, Readable } from "stream";
import type { VoidIdentity } from "./index";
import {
	CONVO_INPUT,
	CONVO_REQUEST,
	REPLICATION,
	VOID_PEER_AVATAR,
	VOID_PEER_BIO,
	VOID_PEER_NAME,
	VOID_VERSION,
} from "./constants";
import { InvalidPeer } from "./errors";
import {
	ConversationInput,
	ConversationPeer,
	ConversationRequest,
} from "./proto/conversation";
import { CachedPeer } from "./proto/peer";
import { VersionTag } from "./proto/version";
import { extractConvoId, imageToUri, unseal } from "./util";

export class VoidPeer extends EventEmitter2 {
	peerId: string;
	publicKey: Buffer;
	boxPublicKey!: Buffer;
	sharedSecret!: Buffer;
	hostId!: Buffer;

	feed!: HyperBee;
	live!: Readable;

	private socket: Duplex;
	private info: PeerInfo;
	private plex: Multiplex;

	private host: VoidIdentity;

	constructor(socket: Duplex, info: PeerInfo, host: VoidIdentity) {
		super({ wildcard: true });
		this.socket = socket;
		this.info = info;
		this.host = host;
		this.peerId = info.publicKey.toString("hex");
		this.publicKey = info.publicKey;

		socket.on("error", (err) => this.close(err));
		socket.on("end", () => this.close());

		this.plex = multiplex();
		socket.pipe(this.plex as any).pipe(socket);

		const replication = this.plex.createSharedStream(REPLICATION);
		replication
			.on("error", console.error)
			.pipe(host.corestore.replicate(info.client))
			.pipe(replication);
	}

	async close(err?: Error) {
		this.removeAllListeners();
		this.plex?.end(() => this.plex.destroy());
		this.feed?._feed.close();
		this.socket.destroy();
		if (err) {
			this.emit(["peer", "error"], {
				publicKey: this.publicKey,
				error: err,
			});
		}
		this.emit(["peer", "disconnect"], this.publicKey);
	}

	static async open(
		socket: Duplex,
		info: PeerInfo,
		host: VoidIdentity,
	): Promise<VoidPeer> {
		const peer = new VoidPeer(socket, info, host);
		peer.feed = new HyperBee(host.corestore.get(peer.publicKey));
		const cached: CachedPeer = await host.peerCache
			.get(peer.publicKey)
			.catch(() => null);
		if (cached) {
			peer.boxPublicKey = cached.boxPublicKey;
			peer.sharedSecret = cached.sharedSecret;
			peer.hostId = cached.hostId;
		} else {
			const boxPublicKey = Buffer.allocUnsafe(
				sodium.crypto_box_PUBLICKEYBYTES,
			);
			const sharedSecret = Buffer.allocUnsafe(
				sodium.crypto_scalarmult_BYTES,
			);
			const hostId = Buffer.allocUnsafe(32);
			sodium.crypto_sign_ed25519_pk_to_curve25519(
				boxPublicKey,
				peer.publicKey,
			);
			sodium.crypto_scalarmult(
				sharedSecret,
				host.boxKeyPair.secretKey,
				boxPublicKey,
			);
			sodium.crypto_generichash(
				hostId,
				host.keyPair.publicKey,
				sharedSecret,
			);
			peer.boxPublicKey = boxPublicKey;
			peer.sharedSecret = sharedSecret;
			peer.hostId = hostId;
		}
		const tag = await peer.feed.get(VOID_VERSION).catch(() => null);
		if (!tag) {
			await peer.close();
			throw new InvalidPeer();
		}
		const version = VersionTag.decode(tag.value as Buffer);
		if (!cached || cached.profile < version.profile) {
			const name = await peer.feed
				.get(VOID_PEER_NAME)
				.catch(() => ({ value: "" }));
			const bio = await peer.feed
				.get(VOID_PEER_BIO)
				.catch(() => ({ value: "" }));
			await host.peerCache.put(peer.publicKey, {
				publicKey: peer.publicKey,
				boxPublicKey: peer.boxPublicKey,
				sharedSecret: peer.sharedSecret,
				hostId: peer.hostId,
				profile: version.profile,
				name: name.value.toString(),
				bio: bio.value.toString(),
			} as CachedPeer);
		}
		peer.feed
			.get(VOID_PEER_AVATAR)
			.then(({ value }) => {
				const avatar = imageToUri(value as Buffer);
				peer.emit(["peer", "avatar"], {
					publicKey: peer.publicKey,
					avatar,
				});
			})
			.catch(console.error);
		peer.emit(["peer", "connect"], peer.publicKey);
		return peer;
	}

	replicate() {
		const requestPrefix = Buffer.concat([CONVO_REQUEST, this.hostId]);
		const requestSuffix = Buffer.concat([
			CONVO_REQUEST,
			this.hostId,
			Buffer.allocUnsafe(72).fill(0xff),
		]);
		const inputPrefix = Buffer.concat([CONVO_INPUT, this.hostId]);
		const inputSuffix = Buffer.concat([
			CONVO_INPUT,
			this.hostId,
			Buffer.allocUnsafe(72).fill(0xff),
		]);
		this.live = this.feed
			.createHistoryStream({ live: true })
			.on("error", console.error)
			.on(
				"data",
				async ({
					type,
					key,
					value,
				}: {
					type: "put" | "del";
					key: Buffer;
					value: Buffer;
				}) => {
					if (type === "put") {
						if (
							Buffer.compare(key, requestPrefix) > 0 &&
							Buffer.compare(key, requestSuffix) <= 0
						) {
							try {
								const id = extractConvoId(
									key,
									this.host.boxKeyPair,
								);
								const convo: ConversationInput =
									await this.host.convoStore
										.get(id)
										.catch(() => null);
								const msg = unseal(
									value,
									this.host.boxKeyPair,
								);
								const req = ConversationRequest.decode(msg);
								if (convo && convo.name !== req.name) {
									this.emit(["conversation", "rename"], {
										id,
										name: req.name,
									});
								}
								if (!convo) {
									this.emit(["conversation", "request"], {
										id,
										name: req.name,
										peers: req.peers,
									});
								}
							} catch (err) {
								console.error(err);
							}
						} else if (
							Buffer.compare(key, inputPrefix) > 0 &&
							Buffer.compare(key, inputSuffix) <= 0
						) {
							try {
								const id = extractConvoId(
									key,
									this.host.boxKeyPair,
								);
								const msg = unseal(
									value,
									this.host.boxKeyPair,
								);
								const input = ConversationPeer.decode(msg);
								const convo: ConversationInput =
									await this.host.convoStore
										.get(id)
										.catch(() => null);
								if (convo) {
									if (!convo.peers[this.peerId]) {
										convo.peers[this.peerId] = input;
										await this.host.convoStore.put(
											id,
											convo,
										);
										this.emit(["conversation", "input"], {
											id,
											publicKey: this.publicKey,
										});
									}
								} else {
									let orphans = this.host.orphanedInputs.get(
										id.toString("hex"),
									);
									if (!orphans) {
										orphans = new Map<
											string,
											ConversationPeer
										>();
									}
									orphans.set(this.peerId, input);
									this.host.orphanedInputs.set(
										id.toString("hex"),
										orphans,
									);
									console.error(
										`Found input for unknown conversation: "${id.toString(
											"hex",
										)}"`,
									);
								}
							} catch (err) {
								console.error(err);
							}
						}
					}
				},
			);
	}
}
