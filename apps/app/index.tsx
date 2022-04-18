import { registerRootComponent } from "expo";
import notifee from "@notifee/react-native";
import { EventEmitter2 } from "eventemitter2";
import App from "./App";

const emitter = new EventEmitter2();

notifee.registerForegroundService(
	() =>
		new Promise(async (remove) => {
			let interval: any;
			let count = 0;

			emitter.on("start", () => {
				interval = setInterval(
					() => emitter.emit("run", ++count),
					1500,
				);
			});
			emitter.on("stop", () => clearInterval(interval));
			emitter.on("reset", () => (count = 0));
		}),
);

registerRootComponent(() => <App emitter={emitter} />);
