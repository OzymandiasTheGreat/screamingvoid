import path from "path";
import { EventEmitter2, Listener } from "eventemitter2";
import { event, path as tauriPath, tauri } from "@tauri-apps/api";
import { notify } from "./notification";

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
};

export class VoidInterface extends EventEmitter2 {
	private skip: Set<string> = new Set();
	private avatars!: string;
	private _self: { id?: string; name?: string; bio?: string } = {};

	constructor() {
		super({ wildcard: true });
		event.listen("backend-out", ({ payload }) => {
			const ev = JSON.parse(payload as string);
			this.skip.add(ev.event);
			if (ev.event === "avatars") {
				this.avatars = ev.payload[0];
				this.skip.add("backend.ready");
				setTimeout(() => {
					this.emit(["backend", "ready"]);
				}, 150);
			} else if (ev.event === "self") {
				this._self = ev.payload[0];
				this.skip.add("update.profile");
				this.emit(["update", "profile"], ev.payload[0]);
			} else {
				this.emit(ev.event, ...ev.payload);
			}
		});
		this.onAny((ev, ...payload) => {
			if (!this.skip.has(ev as string)) {
				event.emit(
					"backend-in",
					JSON.stringify({ event: ev, payload })
				);
			}
		});
		event.emit(
			"backend-in",
			JSON.stringify({ event: "request.self", payload: [] })
		);
		Promise.all([
			tauriPath.cacheDir(),
			tauriPath.configDir(),
			tauriPath.localDataDir(),
		]).then(([cache, config, data]) =>
			event.emit(
				"backend-in",
				JSON.stringify({
					event: "paths",
					payload: [{ cache, config, data }],
				})
			)
		);
		this.on(
			["conversation", "request"],
			({ name, peers }: { name: string; peers: any[] }) => {
				let body: string;
				const names = peers
					.filter((p) => p.id !== this.self.id)
					.map((p) => p.name);
				const largeIcon = this.getAvatar(
					peers.find((p) => p.id !== this.self.id)?.id as string
				);
				switch (names.length) {
					case 1:
						body = `${names[0]} wants to chat with you!`;
						break;
					case 2:
						body = `${names[0]} and ${names[1]} want to chat with you in ${name}!`;
						break;
					case 3:
						body = `${names[0]}, ${names[1]}, and ${names[2]} want to chat with you in ${name}!`;
						break;
					default:
						body = `${names[0]}, ${names[1]}, and ${
							names.length - 2
						} more want to chat with you in ${name}!`;
				}
				notify({
					title: "New Chat Request",
					body,
				});
			}
		);
		this.on(["conversation", "message", "*"], ({ message }) => {
			const title = message.sender.name || message.sender.id;
			const icon = path.join(this.avatars, message.sender.id);
			if (message.sender.id !== this.self.id) {
				notify({
					title,
					body: message.body,
					icon,
				});
			}
		});
		this.on(["request", "close"], () => {
			const loaded = this.listeners("loaded");
			const requests = this.listeners(["conversation", "request"]);
			const messages = this.listeners(["conversation", "message", "*"]);
			this.removeAllListeners();
			loaded.forEach((listener) => this.on("loaded", listener));
			requests.forEach((listener) =>
				this.on(["conversation", "request"], listener)
			);
			messages.forEach((listener) =>
				this.on(["conversation", "message", "*"], listener)
			);
		});
	}

	on(event: any, listener: (...args: any[]) => void): Listener {
		return super.on(event, listener, { objectify: true }) as any;
	}

	getAvatar(id: string): string {
		if (!this.avatars) {
			throw new Error("Avatar cache path not set");
		}
		event.emit(
			"backend-in",
			JSON.stringify({ event: "ensure.avatar", payload: [id] })
		);
		return tauri.convertFileSrc(path.join(this.avatars, id ?? ""));
	}

	get self() {
		return this._self;
	}

	async updateProfile(payload: {
		avatar?: string;
		name?: string;
		bio?: string;
	}) {
		this.emit(["request", "update", "profile"], payload);
		return this.waitFor("update.profile", 7500)
			.then(() => {})
			.catch(() => {});
	}
}
