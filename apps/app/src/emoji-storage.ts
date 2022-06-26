// @ts-ignore
import { store } from "emoji-mart-native";
import type levelup from "levelup";
import sublevel from "subleveldown";

export class EmojiStorage {
	storage: levelup.LevelUp;
	cache!: Record<string, any>;
	update!: (key: string, value: any) => void;

	constructor(prefs: levelup.LevelUp) {
		this.storage = sublevel(prefs, "VOID_EMOJI_STORAGE", {
			keyEncoding: "utf8",
			valueEncoding: "json",
		});
		this.setup();
	}

	async setup() {
		const skin = await this.storage.get("skin").catch(() => 1);
		const frequently = await this.storage
			.get("frequently")
			.catch(() => ({}));
		const last = await this.storage.get("last").catch(() => undefined);
		this.cache = { skin, frequently, last };
		this.update = (key, value) => (this.cache[key] = value);
		this.storage.on("put", this.update);
		store.setHandlers({
			getter: this.getter.bind(this),
			setter: this.setter.bind(this),
		});
	}

	close() {
		this.storage.off("put", this.update);
	}

	getter(key: string): any {
		return this.cache[key];
	}

	setter(key: string, value: any): Promise<void> {
		return this.storage.put(key, value);
	}
}
