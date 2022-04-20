declare module "hyperswarm" {
	import type { Duplex } from "stream";

	type KeyPair = { publicKey: Buffer, secretKey: Buffer };

	class PeerDiscovery {
		flushed(): Promise<void>;
		refresh(opts: { client: boolean, server: boolean }): Promise<void>;
		destroy(): Promise<void>;
	}

	class PeerInfo {
		publicKey: Buffer;
		topics: Buffer[];
		prioritized: boolean;
		client: boolean;
		ban(): void;
	}

	class Hyperswarm {
		constructor(opts?: {
			keyPair?: KeyPair,
			seed?: Buffer,
			maxPeers?: number,
			firewall?: (remotePublicKey: Buffer) => boolean,
			dht?: any,   // TODO ???
		});

		connections: Set<any>;   // TODO Double check type
		peers: Map<string, PeerInfo>;
		dht: any;   // TODO ???
		maxPeers: number;

		join(topic: Buffer, opts: { client: boolean, server: boolean }): PeerDiscovery;
		leave(topic: Buffer): Promise<void>;
		joinPeer(noisePublicKey: Buffer): void;   // TODO Double check return type
		leavePeer(noisePublicKey: Buffer): void;
		status(topic: Buffer): PeerDiscovery;
		listen(): Promise<void>;
		flush(): Promise<void>;
		destroy(): Promise<void>;

		on(event: "connection", cb: (socket: Duplex, info: PeerInfo) => void): void;
	}

	export default Hyperswarm;
	export type { PeerInfo, PeerDiscovery };
}
