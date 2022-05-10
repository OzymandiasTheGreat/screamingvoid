import "./shim";
import { registerRootComponent } from "expo";
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from "@notifee/react-native";
import { VoidInterface } from "./src/interface";
import App from "./App";

let emitter = new VoidInterface();

notifee.registerForegroundService(
	(notification) =>
		new Promise(async (remove) => {
			emitter.listen();
		})
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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(() => <App emitter={emitter} />);
