import "./shim";
import { registerRootComponent } from "expo";
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from "@notifee/react-native";
import { VoidInterface } from "./src/interface";
import App from "./App";

notifee.createChannel({
	id: "service",
	name: "Network Background Service",
	description: "Persistent notification indicating network status",
	importance: AndroidImportance.LOW,
	visibility: AndroidVisibility.SECRET,
});
notifee.createChannel({
	id: "chat",
	name: "Chat",
	description: "Conversation request and new message notifications",
	importance: AndroidImportance.HIGH,
	visibility: AndroidVisibility.PRIVATE,
});

let emitter = new VoidInterface();
notifee.registerForegroundService(
	(notification) =>
		new Promise(async (remove) => {
			emitter.listen();
		})
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(() => <App emitter={emitter} />);
