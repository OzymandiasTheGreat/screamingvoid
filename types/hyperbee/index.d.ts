declare module "hyperbee" {
	import { Readable } from "stream";
	import Hypercore from "hypercore";

	type IterableOptions = {
		gt?: string | Buffer,
		gte?: string | Buffer,
		lt?: string | Buffer,
		lte?: string | Buffer,
		reverse?: boolean,
		limit?: number,
	}

	class Batch {
		put(key: string | Buffer, value?: string | Buffer | object): Promise<void>;
		get(key: string | Buffer): Promise<{ seq: number, key: string | Buffer, value: string | Buffer | object }>;
		del(key: string | Buffer): Promise<void>;
		flush(): Promise<void>;
		destroy(): void;
	}

	class HyperBee {
		constructor(feed: Hypercore, options?: {
			extension?: boolean,
			keyEncoding?: "binary" | "ascii" | "utf8",
			valueEncoding?: "binary" | "ascii" | "utf8" | "json",
		});

		version: number;
		_feed: Hypercore;

		put(key: string | Buffer, value?: string | Buffer | object): Promise<void>;
		get(key: string | Buffer, opts?: { update: boolean }): Promise<{ seq: number, key: string | Buffer, value: string | Buffer | object }>;
		del(key: string | Buffer): Promise<void>;
		batch(opts?: { update: boolean }): Batch;
		createReadStream(options?: IterableOptions): Readable;
		peek(options?: IterableOptions): Promise<{ seq: number, key: string | Buffer, value: string | Buffer | object }>;
		createHistoryStream(options?: { live?: boolean } & IterableOptions): Readable;
		createDiffStream(otherVersion: HyperBee, options?: any): Readable;
		checkout(version: number): HyperBee;
		snapshot(): HyperBee;
		sub(prefix: string | Buffer, opts?: {
			sep?: string | Buffer,
			valueEncoding?: "binary" | "ascii" | "utf8" | "json",
			keyEncoding?: "binary" | "ascii" | "utf8",
		}): HyperBee;
		ready(): Promise<void>;
	}

	export default HyperBee;
	export type { IterableOptions };
}
