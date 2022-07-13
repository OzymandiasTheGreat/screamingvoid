declare module "corestore" {
	import { Duplex } from "stream";
	import raf from "random-access-file";
	import Hypercore, { HypercoreOptions } from "hypercore";

	class Corestore {
		constructor(storage: string | raf);

		get(
			key: Buffer | ({ key?: Buffer; name?: string } & HypercoreOptions),
			options?: { key?: Buffer; name?: string } & HypercoreOptions,
		): Hypercore;
		replicate(isInitiator: boolean | Duplex): Duplex;
		namespace(name: string): Corestore;
		close(): Promise<void>;
	}

	export default Corestore;
}
