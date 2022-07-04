import { Buffer } from "buffer";

export const imageURIs = (message: string): string[] => {
	const regEx = /https?:\S+?\.(?:gif|jpe?g|png)/gi;
	return [...message.matchAll(regEx)].map((m) => m[0]);
};

export const parsePeer = (peer: string): string => {
	let pk: Buffer;
	if (peer.length === 64) {
		pk = Buffer.from(peer, "hex");
	} else if (peer.startsWith("screamingvoid://")) {
		pk = Buffer.from(peer.slice("screamingvoid://peer/".length), "hex");
	} else {
		throw new Error("InvalidPeer");
	}
	return pk.toString("hex");
};

export const encodePeer = (peer: string): string => {
	const uri = "screamingvoid://peer/" + peer;
	return uri;
};
