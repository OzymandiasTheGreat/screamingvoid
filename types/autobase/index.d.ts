declare module "autobase" {
	import { Readable } from "stream";
	import Hypercore from "hypercore";

	class LinearizedView {
		status: { added: number, removed: number };
		length: number;

		update(): Promise<void>;
		get(idx: number): Promise<{ clock: number[], value: any }>;
		get(idx: number, opts?: { unwrap: false }): Promise<{ clock: number[], value: any }>;
		get(idx: number, opts?: { unwrap: true }): Promise<any>;
		append(blocks: any[]): Promise<void>;
	}

	class Autobase {
		constructor(opts: {
			inputs?: Hypercore[],
			outputs?: Hypercore[],
			localInput?: Hypercore,
			localOutput?: Hypercore,
			autostart?: boolean,
			apply?: (batch: any[]) => Promise<void>,
			unwrap?: boolean,
		});

		inputs: Hypercore[];
		outputs: Hypercore[];
		localInput: Hypercore | null;
		localOutput: Hypercore | null;
		started: boolean;
		view?: LinearizedView;

		clock(): Map<string, number>;
		isAutobase(core: Hypercore): boolean;
		append(value: any, clock?: number[], input?: Hypercore): Promise<void>;
		latest(inputs: Hypercore[]): Promise<number[]>;
		addInput(input: Hypercore): Promise<void>;
		removeInput(input: Hypercore): Promise<void>;
		addOutput(output: Hypercore): Promise<void>;
		removeOutput(output: Hypercore): Promise<void>;
		start(opts?: { apply?: (batch: any[]) => Promise<void>, unwrap: boolean }): void;

		createCausalStream(): Readable;
		createReadStream(opts?: {
			live?: boolean,
			tail?: boolean,
			map?: (node: any) => void,
			checkpoint?: any, // Resume from where a previous read stream left off (`readStream.checkpoint`)
			wait?: boolean,
			onresolve?: (node: any) => boolean,
			onwait?: (node: any) => void,
		}): { checkpoint: any } & Readable;
	}

	export default Autobase;
}
