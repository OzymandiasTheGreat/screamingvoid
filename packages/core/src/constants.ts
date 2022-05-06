import { Buffer } from "buffer";

export const VOID_VERSION = Buffer.from("\x00\x00VOID_VERSION");

export const VOID_ID_PREFIX = Buffer.from("\x00VOID_IDENTITY_");
export const VOID_ID_SUFFIX = Buffer.concat([
	VOID_ID_PREFIX,
	Buffer.alloc(16).fill(0xff),
]);
export const VOID_PEER_NAME = Buffer.concat([
	VOID_ID_PREFIX,
	Buffer.from("NAME"),
]);
export const VOID_PEER_BIO = Buffer.concat([
	VOID_ID_PREFIX,
	Buffer.from("BIO"),
]);
export const VOID_PEER_AVATAR = Buffer.concat([
	VOID_ID_PREFIX,
	Buffer.from("AVATAR"),
]);

export const REPLICATION = "VOID_REPLICATION_STREAM";
