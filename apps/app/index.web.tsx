import { registerRootComponent } from "expo";
import { event, shell } from "@tauri-apps/api";
import { EventEmitter2 } from "eventemitter2";
import App from "./App";

const backend = shell.Command.sidecar("binaries/backend");
backend.spawn();

const emitter = new EventEmitter2();

event.listen("backend-out", ({ payload }) => {
	const ev = JSON.parse(payload as string);
	emitter.emit(ev.event, ev.payload);
});
emitter.onAny((ev, payload) => {
	if (typeof payload === "undefined") {
		event.emit("backend-in", JSON.stringify({ event: ev }));
	} else {
		event.emit("backend-in", JSON.stringify({ event: ev, payload }));
	}
});

registerRootComponent(() => <App emitter={emitter} />);
