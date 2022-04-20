declare module "multiplex" {
	import { Duplex } from "stream";

	type MultiplexOptions = {
		chunked: boolean,
		halfOpen: boolean,
	}

	class Multiplex extends Duplex {
		createStream(id: string, options?: MultiplexOptions): Duplex;
		receiveStream(id: string, options?: MultiplexOptions): Duplex;
		createSharedStream(id: string, options?: MultiplexOptions): Duplex;

		on(event: "error", callback: (err: Error | null) => void): void;
		on(event: "stream", callback: (stream: Duplex, id: string) => void): void;
	}

	function multiplex(options?: { limit?: number }, onStream?: (stream: Duplex, id: string) => void): Multiplex;

	export default multiplex;
	export type { Multiplex };
}
