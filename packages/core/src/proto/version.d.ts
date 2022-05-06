type Purpose = {
	PEER: 0;
	MIRRORING: 1;
	MODERATION: 2;
	ADVERTISEMENT: 3;
};

export const Purpose: Purpose;

type VersionTag = {
	version: number;
	purpose: number;
	profile: number;
};
const _tag: VersionTag;
const _buf: Buffer;

export const VersionTag = {
	encode: (message: VersionTag) => _buf,
	decode: (buf: Buffer) => _tag,
};
