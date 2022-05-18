import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { EventEmitter2 } from "eventemitter2";
import paths from "env-paths";
import { VoidIdentity } from "@screamingvoid/core";

const env = paths("me.screamingvoid.app");
const AVATARS = path.join(env.cache, "avatars");
fs.mkdir(AVATARS, { recursive: true });

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
	encryptionKey: string;
};

export class VoidInterface extends EventEmitter2 {
	private rl: readline.Interface;
	private core?: VoidIdentity;

	constructor() {
		super({ wildcard: true });
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});
		this.rl.on("line", (line) => {
			try {
				const ev = JSON.parse(line);
				this.emit(ev.event, ...ev.payload);
			} catch (err) {
				process.exit(2);
			}
		});
		this.on(["is", "loaded"], () => this.send("loaded", !!this.core));
		this.on(
			["request", "create"],
			async (
				data: SavedIdentity & {
					name: string;
					bio: string;
					avatar: string;
				}
			) => {
				const keyPair = {
					publicKey: Buffer.from(data.publicKey, "hex"),
					secretKey: Buffer.from(data.secretKey, "hex"),
				};
				const encryptionKey = Buffer.from(data.encryptionKey, "hex");
				this.core = await VoidIdentity.create(
					env.data,
					keyPair,
					encryptionKey,
					data.name,
					data.bio,
					data.avatar
				);
				this.core.on(["peer", "avatar"], (data) =>
					fs.writeFile(
						path.join(AVATARS, data.publicKey),
						Buffer.from(data.avatar, "base64url")
					)
				);
				this.core.onAny((event, ...payload) =>
					this.send(event, payload)
				);
				await fs.writeFile(
					path.join(AVATARS, data.publicKey),
					Buffer.from(data.avatar, "base64url")
				);
				this.send("loaded", true);
			}
		);
		this.on(["request", "open"], async (data: SavedIdentity) => {
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			const encryptionKey = Buffer.from(data.encryptionKey, "hex");
			this.core = await VoidIdentity.open(
				env.data,
				keyPair,
				encryptionKey
			);
			this.core.on(["peer", "avatar"], (data) =>
				fs.writeFile(
					path.join(AVATARS, data.publicKey),
					Buffer.from(data.avatar, "base64url")
				)
			);
			this.core.onAny((event, ...payload) => this.send(event, payload));
			this.send("loaded", true);
		});
		this.on(["ensure", "avatar"], (pk: string) => {
			fs.access(path.join(AVATARS, pk)).catch(() =>
				this.core?.lookup(Buffer.from(pk, "hex"))
			);
		});
		this.on(["request", "avatars"], () => {
			this.send("avatars", AVATARS);
		});
	}

	send(event: string | string[], ...payload: any[]): void {
		if (typeof event !== "string") {
			event = event.join(".");
		}
		console.log(JSON.stringify({ event, payload }));
	}
}

const iface = new VoidInterface();
