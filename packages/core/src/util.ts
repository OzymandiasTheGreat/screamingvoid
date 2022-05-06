import { Buffer } from "buffer";
import { Image } from "./proto/image";

export class Defered<T> {
	promise: Promise<T>;
	resolve!: (result: T) => void;
	reject!: (err: Error) => void;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

export function uriToImage(uri: string): Buffer {
	if (!uri) {
		return Buffer.alloc(0);
	}
	const mimetype = uri.slice(5, uri.indexOf(";"));
	const base64 = uri.slice(uri.indexOf(","));
	const data = Buffer.from(base64, "base64");
	return Image.encode({ mimetype, data });
}

export function imageToUri(buf: Buffer): string {
	if (!buf.byteLength) {
		return "";
	}
	const image = Image.decode(buf);
	return `data:${image.mimetype};base64,${image.data.toString("base64")}`;
}
