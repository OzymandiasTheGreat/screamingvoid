declare module "@geut/hyperbee-live-stream" {
	import { Readable } from "stream";
	import HyperBee, { IterableOptions } from "hyperbee";

	export class HyperbeeLiveStream extends Readable {
		constructor(db: HyperBee, opts?: { old?: boolean } & IterableOptions);
	}
}
