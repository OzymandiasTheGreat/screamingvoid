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
