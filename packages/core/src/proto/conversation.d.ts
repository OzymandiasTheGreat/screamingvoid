const _buf: Buffer;

type ConversationMeta = {
	name: string;
	archived: boolean;
	muted: boolean;
};
const _meta: ConversationMeta;

export const ConversationMeta = {
	encode: (message: ConversationMeta) => _buf,
	decode: (buf: Buffer) => _meta,
};

type ConversationPeer = {
	input: Buffer;
	storage: Buffer;
};
const _peer: ConversationPeer;

export const ConversationPeer = {
	encode: (message: ConversationPeer) => _buf,
	decode: (buf: Buffer) => _peer,
};

type ConversationInput = {
	name: string;
	peers: Record<string, ConversationPeer>;
};
const _convo: ConversationInput;

export const ConversationInput = {
	encode: (message: ConversationInput) => _buf,
	decode: (buf: Buffer) => _convo,
};

type ConversationRequest = {
	name: string;
	peers: Buffer[];
};
const _req: ConversationRequest;

export const ConversationRequest = {
	encode: (message: ConversationRequest) => _buf,
	decode: (buf: Buffer) => _req,
};

type ChatInputType = {
	POST: 1;
	REPLY: 2;
	DELETE: 3;
	REACT: 4;
};

export const ChatInputType: ChatInputType;

type ChatReaction = {
	char: string;
	sender: Buffer;
};
const _react: ChatReaction;

export const ChatReaction = {
	encode: (message: ChatReaction) => _buf,
	decode: (buf: Buffer) => _react,
};

type ChatHash = {
	body: Buffer;
	attachments: Record<string, Buffer>;
};
const _hash: ChatHash;

export const ChatHash = {
	encode: (message: ChatHash) => _buf,
	decode: (buf: Buffer) => _hash,
};

type ChatMessage = {
	id: Buffer;
	sender: Buffer;
	timestamp: number;
	hashes: ChatHash;
	body: string;
	reaction: ChatReaction[];
	target?: Buffer;
	attachments: string[];
};
const _msg: ChatMessage;

export const ChatMessage = {
	encode: (message: ChatMessage) => _buf,
	decode: (buf: Buffer) => _msg,
};

type ChatInput = {
	type: number;
	sender: Buffer;
	timestamp: number;
	hashes: ChatHash;
	target?: Buffer;
	body?: string;
	reaction?: string;
	attachments: string[];
};
const _inp: ChatInput;

export const ChatInput = {
	encode: (message: ChatInput) => _buf,
	decode: (buf: Buffer) => _inp,
};
