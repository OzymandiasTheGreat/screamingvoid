declare module "hypercore" {
	import { Readable, Duplex } from "stream";
	import raf from "random-access-file";

	type KeyPair = { publicKey: Buffer, secretKey: Buffer };
	type HypercoreOptions = {
		createIfMissing?: boolean,
		overwrite?: boolean,
		valueEncoding?: "binary" | "utf8" | "json",
		encodeBatch?: (batch: any) => void,   // TODO batch format?
		keyPair?: KeyPair,
		encryptionKey?: Buffer,
	};
	type Range = {
		downloaded: () => Promise<void>,
		destroy: () => void,
	};

	class Hypercore {
		constructor(storage: string | raf, key?: Buffer | HypercoreOptions, options?: HypercoreOptions);
		append(block: Buffer | string | any): Promise<number>;
		get(index: number, options: {
			wait: boolean, // wait for block to be downloaded
			onwait: () => void, // hook that is called if the get is waiting for download
			timeout: number, // wait at max some milliseconds (0 means no timeout)
			valueEncoding: "binary" | "utf8" | "json",
		}): Promise<Buffer | string | any>;
		truncate(newLength: number, forkId?: number): Promise<void>;
		treeHash(length?: number): Promise<Buffer>;
		createReadStream(options: {
			start: number,
			end: number,
			live: boolean,
			snapshot: boolean,
		}): Readable;
		download(range?: {
			start?: number,
			end?: number,
			blocks?: number[],
			linear?: boolean,
		}): Range;
		seek(byteOffset: number): Promise<[number, number]>;
		update(): Promise<boolean>;
		close(): Promise<void>;
		ready(): Promise<void>;
		replicate(isInitiator: boolean | Duplex): Duplex;

		on(event: "close", callback: () => void): void;
		on(event: "ready", callback: () => void): void;
		on(event: "append", callback: () => void): void;
		on(event: "truncate", callback: (ancestors: any, forkId: number) => void): void;

		writable: boolean;
		readable: boolean;
		key: Buffer;
		keyPair: KeyPair;
		discoveryKey: Buffer;
		encryptionKey: Buffer;
		length: number;
		byteLength: number;
		fork: number;
		padding: number;
	}

	export default Hypercore;
	export type { HypercoreOptions };
}
