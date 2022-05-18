import path from "path";
import { EventEmitter2 } from "eventemitter2";
import { event, shell, tauri } from "@tauri-apps/api";

const backend = shell.Command.sidecar("binaries/backend");
backend.spawn();

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
	encryptionKey: string;
};

export class VoidInterface extends EventEmitter2 {
	private skip: Set<string> = new Set();
	private avatars!: string;
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
			JSON.stringify({ event: "request.avatars", payload: [] })
		);
	}

	getAvatar(id: string): string {
		if (!this.avatars) {
			throw new Error("Avatar cache path not set");
		}
		event.emit(
			"backend-in",
			JSON.stringify({ event: "ensure.avatar", payload: [id] })
		);
		return tauri.convertFileSrc(path.join(this.avatars, id));
	}
}
