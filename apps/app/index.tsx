import "./shim";
import { registerRootComponent } from "expo";
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from "@notifee/react-native";
import { EventEmitter2 } from "eventemitter2";
import App from "./App";
import type { SavedIdentity } from "./src/types/identity";

const emitter = new EventEmitter2();

notifee.registerForegroundService(
	(notification) =>
		new Promise(async (remove) => {
			let interval: any;
			let count = 0;
			let identity: SavedIdentity | null = null;

			emitter.on("isLoaded", () => {
				emitter.emit("loaded", !!identity);
				console.log(identity);
			});
			emitter.on("requestLoad", (id) => {
				// TODO Clean up
				setTimeout(() => {
					identity = id;
					console.log(id);
					emitter.emit("loaded", true);
				}, 250);
			});

			emitter.on("start", () => {
				interval = setInterval(
					() => emitter.emit("run", ++count),
					1500,
				);
				notifee.displayNotification({
					...notification,
					body: "Connected to the Void network",
				});
			});
			emitter.on("stop", () => {
				clearInterval(interval);
				notifee.displayNotification({
					...notification,
					body: "Disconnected from Void network",
				});
			});
			emitter.on("reset", () => (count = 0));
		}),
);

notifee.createChannel({
	id: "service",
	name: "Void Network Service",
	importance: AndroidImportance.NONE,
	visibility: AndroidVisibility.PUBLIC,
});

notifee.displayNotification({
	id: "service",
	body: "Void is running",
	title: "Void",
	android: {
		asForegroundService: true,
		channelId: "service",
	},
});

registerRootComponent(() => <App emitter={emitter} />);
