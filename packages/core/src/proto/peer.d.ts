type CachedPeer = {
	publicKey: Buffer;
	boxPublicKey: Buffer;
	sharedSecret: Buffer;
	hostId: Buffer;

	profile: number;
	name: string;
	bio: string;
};
const _peer: CachedPeer;
const _buf: Buffer;

export const CachedPeer = {
	encode: (message: CachedPeer) => _buf,
	decode: (buf: Buffer) => _peer,
};
