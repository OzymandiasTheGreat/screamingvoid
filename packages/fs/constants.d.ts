declare module "filesystem-constants" {
	import type { constants } from "fs";
	export const linux: typeof constants;
	export const parse: (constants: typeof constants, flags: string) => number;
}
