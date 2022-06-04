export class IdentityNotFound extends Error {
	constructor() {
		super();
		this.name = "IdentityNotFound";
		this.message =
			"No Identity found for these args. Call create for a new Identity";
	}
}

export class InvalidPeer extends Error {
	constructor() {
		super();
		this.name = "InvalidPeer";
		this.message = "Peer does not conform to the protocol";
	}
}

export class NotConvoKey extends Error {
	constructor() {
		super();
		this.name = "NotConversationKey";
		this.message = "Not a valid Conversation Key";
	}
}

export class InvalidLength extends Error {
	constructor(actual: number, expected: number) {
		super();
		this.name = "InvalidBufferLength";
		this.message = `Invalid Buffer length. Expected ${expected}, got ${actual}`;
	}
}

export class DecryptionError extends Error {
	constructor() {
		super();
		this.name = "DecryptionError";
		this.message = "Decrypting message with given key pair failed.";
	}
}

export class ConvoNotFound extends Error {
	constructor(id: Buffer) {
		super();
		this.name = "ConversationNotFound";
		this.message = `Conversation with id ${id.toString("hex")} not found`;
	}
}

export class MessageNotFound extends Error {
	constructor() {
		super();
		this.name = "MessageNotFound";
		this.message = "Message not found";
	}
}
