import { EventEmitter2 } from "eventemitter2";
import HyperBee from "hyperbee";
import { PeerInfo } from "hyperswarm";
import multiplex, { Multiplex } from "multiplex";
import sodium from "sodium-universal";
import { Duplex } from "stream";
import type { VoidIdentity } from ".";
import {
	REPLICATION,
	VOID_PEER_AVATAR,
	VOID_PEER_BIO,
	VOID_PEER_NAME,
	VOID_VERSION,
} from "./constants";
import { InvalidPeer } from "./errors";
import { CachedPeer } from "./proto/peer";
import { VersionTag } from "./proto/version";
import { imageToUri } from "./util";

export class VoidPeer extends EventEmitter2 {
	id: string;
	publicKey: Buffer;
	curvePublicKey!: Buffer;
	sharedSecret!: Buffer;

	feed!: HyperBee;

	private socket: Duplex;
	private info: PeerInfo;
	private plex: Multiplex;

	private host: VoidIdentity;

	constructor(socket: Duplex, info: PeerInfo, host: VoidIdentity) {
		super({ wildcard: true });
		this.socket = socket;
		this.info = info;
		this.host = host;
		this.id = info.publicKey.toString("hex");
		this.publicKey = info.publicKey;

		socket.on("error", (err) => {
			console.warn("Peer Socket Error: ", err);
			this.close();
		});
		socket.on("end", () => this.close());

		this.plex = multiplex();
		socket.pipe(this.plex as any).pipe(socket);

		const replication = this.plex.createSharedStream(REPLICATION);
		replication
			.pipe(host.corestore.replicate(info.client))
			.pipe(replication);
	}

	async close() {
		this.plex?.end(() => this.plex?.destroy());
		this.feed?._feed.close();
		this.socket.destroy();
		this.emit(["peer", "disconnect"], this.id);
	}

	static async open(
		socket: Duplex,
		info: PeerInfo,
		host: VoidIdentity,
	): Promise<VoidPeer> {
		const peer = new VoidPeer(socket, info, host);
		peer.feed = new HyperBee(
			host.corestore.get(peer.publicKey, {
				encryptionKey: host.encryptionKey,
			}),
		);
		const tag = await peer.feed.get(VOID_VERSION);
		if (!tag) {
			await peer.close();
			throw new InvalidPeer();
		}
		const version = VersionTag.decode(tag.value as Buffer);
		// TODO check version and purpose
		const cached: CachedPeer = await host.peerCache
			.get(peer.publicKey)
			.catch(() => null);
		if (cached) {
			peer.curvePublicKey = cached.curvePublicKey;
			peer.sharedSecret = cached.sharedSecret;
		} else {
			const curvePublicKey = Buffer.alloc(
				sodium.crypto_box_PUBLICKEYBYTES,
			);
			const sharedSecret = Buffer.alloc(sodium.crypto_scalarmult_BYTES);
			sodium.crypto_sign_ed25519_pk_to_curve25519(
				curvePublicKey,
				peer.publicKey,
			);
			sodium.crypto_scalarmult(
				sharedSecret,
				host.curveKeyPair.secretKey,
				peer.publicKey,
			);
			peer.curvePublicKey = curvePublicKey;
			peer.sharedSecret = sharedSecret;
		}
		// FIXME
		if (!cached || cached.profile < version.profile) {
			const name = await peer.feed.get(VOID_PEER_NAME);
			const bio = await peer.feed.get(VOID_PEER_BIO);
			await host.peerCache.put(peer.publicKey, {
				publicKey: peer.publicKey,
				curvePublicKey: peer.curvePublicKey,
				sharedSecret: peer.sharedSecret,
				profile: version.profile,
				name: name.value.toString(),
				bio: bio.value.toString(),
			} as CachedPeer);
			peer.feed.get(VOID_PEER_AVATAR).then(({ value }) => {
				const avatar = imageToUri(value as Buffer);
				peer.emit(["peer", "avatar"], { publicKey: peer.id, avatar });
			});
		}
		peer.emit(["peer", "connect"], peer.id);
		return peer;
	}
}
