import { Buffer } from "buffer";
import sodium from "sodium-universal";
import { CONVO_ID_LEN, CONVO_INPUT, CONVO_REQUEST } from "./constants";
import { DecryptionError, InvalidLength, NotConvoKey } from "./errors";
import { Image } from "./proto/image";
import { KeyPair } from "./types";

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

export function extractConvoId(key: Buffer, boxKeyPair: KeyPair): Buffer {
	if (
		!key.slice(0, 1).equals(CONVO_INPUT) &&
		!key.slice(0, 1).equals(CONVO_REQUEST)
	) {
		throw new NotConvoKey();
	}
	if (
		key.byteLength !==
		1 +
			sodium.crypto_sign_PUBLICKEYBYTES +
			CONVO_ID_LEN +
			sodium.crypto_box_SEALBYTES
	) {
		throw new InvalidLength(
			key.byteLength,
			1 +
				sodium.crypto_sign_PUBLICKEYBYTES +
				CONVO_ID_LEN +
				sodium.crypto_box_SEALBYTES,
		);
	}
	const cipher = key.slice(-(CONVO_ID_LEN + sodium.crypto_box_SEALBYTES));
	const id = Buffer.allocUnsafe(CONVO_ID_LEN);
	if (
		!sodium.crypto_box_seal_open(
			id,
			cipher,
			boxKeyPair.publicKey,
			boxKeyPair.secretKey,
		)
	) {
		throw new DecryptionError();
	}
	return id;
}

export function seal(message: Buffer, boxPublicKey: Buffer): Buffer {
	const cipher = Buffer.allocUnsafe(
		message.byteLength + sodium.crypto_box_SEALBYTES,
	);
	sodium.crypto_box_seal(cipher, message, boxPublicKey);
	return cipher;
}

export function unseal(cipher: Buffer, boxKeyPair: KeyPair): Buffer {
	const message = Buffer.allocUnsafe(
		cipher.byteLength - sodium.crypto_box_SEALBYTES,
	);
	if (
		!sodium.crypto_box_seal_open(
			message,
			cipher,
			boxKeyPair.publicKey,
			boxKeyPair.secretKey,
		)
	) {
		throw new DecryptionError();
	}
	return message;
}

export function hash(
	key: Buffer,
	secret?: Buffer | null,
	len?: number,
): Buffer {
	const hash = Buffer.allocUnsafe(
		typeof len === "number" ? len : key.byteLength,
	);
	if (secret) {
		sodium.crypto_generichash(hash, key, secret);
	} else {
		sodium.crypto_generichash(hash, key);
	}
	return hash;
}

export function sign(message: Buffer, secretKey: Buffer): Buffer {
	const sig = Buffer.allocUnsafe(sodium.crypto_sign_BYTES);
	sodium.crypto_sign_detached(sig, message, secretKey);
	return Buffer.concat([sig, message]);
}
