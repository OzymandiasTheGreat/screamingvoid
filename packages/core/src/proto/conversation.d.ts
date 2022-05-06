type StoredConversation = {
	id: Buffer;
	peers: Record<string, Buffer>;
};
const _convo: StoredConversation;
const _buf: Buffer;

export const StoredConversation = {
	encode: (message: StoredConversation) => _buf,
	decode: (buf: Buffer) => _convo,
};
