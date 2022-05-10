import { Buffer } from "buffer";
import { EventEmitter2, Listener } from "eventemitter2";
import path from "path";
import RNFS from "react-native-fs";
import { VoidIdentity } from "@screamingvoid/core";

const AVATARS = path.join(RNFS.CachesDirectoryPath, "avatars");
RNFS.mkdir(AVATARS);

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
	encryptionKey: string;
};

export class VoidInterface extends EventEmitter2 {
	core?: VoidIdentity;

	constructor() {
		super({ wildcard: true });
	}

	private onInternal(event: ["is", "loaded"], listener: () => void): Listener;
	private onInternal(
		event: ["request", "create"],
		listener: (
			data: SavedIdentity & { name: string; bio: string; avatar: string }
		) => void
	): Listener;
	private onInternal(
		event: ["request", "open"],
		listener: (data: SavedIdentity) => void
	): Listener;
	private onInternal(
		event: any,
		listener: (...args: any[]) => void
	): Listener {
		return super.on(event, listener, { objectify: true }) as any;
	}

	on(event: "loaded", listener: (loaded: boolean) => void): Listener;
	on(event: ["peer", "connect"], listener: (id: string) => void): Listener;
	on(event: ["peer", "disconnect"], listener: (id: string) => void): Listener;
	on(
		event: ["peer", "avatar"],
		listener: (data: { id: string; avatar: string }) => void
	): Listener;
	on(event: any, listener: (...args: any[]) => void): Listener {
		return super.on(event, listener, { objectify: true }) as any;
	}

	private emitInternal(event: "loaded", loaded: boolean): boolean;
	private emitInternal(event: string | string[], ...values: any[]): boolean {
		return super.emit(event, ...values);
	}

	emit(event: ["is", "loaded"]): boolean;
	emit(
		event: ["request", "create"],
		data: SavedIdentity & { name: string; bio: string; avatar: string }
	): boolean;
	emit(event: ["request", "open"], data: SavedIdentity): boolean;
	emit(event: string | string[], ...values: any[]): boolean {
		return super.emit(event, ...values);
	}

	listen() {
		this.onInternal(["is", "loaded"], () => {
			this.emitInternal("loaded", !!this.core);
		});
		this.onInternal(["request", "create"], async (data) => {
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			const encryptionKey = Buffer.from(data.encryptionKey, "hex");
			this.core = await VoidIdentity.create(
				RNFS.DocumentDirectoryPath,
				keyPair,
				encryptionKey,
				data.name,
				data.bio,
				data.avatar
			);
			this.core.on(["peer", "avatar"], (data) => {
				RNFS.writeFile(
					path.join(AVATARS, data.publicKey),
					data.avatar,
					"base64"
				);
			});
			this.listenTo(this.core as any, "*");
			await RNFS.writeFile(
				path.join(AVATARS, data.publicKey),
				data.avatar,
				"base64"
			);
			this.emitInternal("loaded", true);
		});
		this.onInternal(["request", "open"], async (data) => {
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			const encryptionKey = Buffer.from(data.encryptionKey, "hex");
			this.core = await VoidIdentity.open(
				RNFS.DocumentDirectoryPath,
				keyPair,
				encryptionKey
			);
			this.core.on(["peer", "avatar"], (data) => {
				RNFS.writeFile(
					path.join(AVATARS, data.publicKey),
					data.avatar,
					"base64"
				);
			});
			this.listenTo(this.core as any, "*");
			this.emitInternal("loaded", true);
		});
	}

	getAvatar(id: string): string {
		const avatar = path.join(AVATARS, id);
		RNFS.exists(avatar).then((exists) => {
			if (!exists) {
				return this.core?.lookup(Buffer.from(id, "hex"));
			}
		});
		return "file://" + avatar;
	}
}
