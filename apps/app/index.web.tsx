import "./shim";
import { registerRootComponent } from "expo";
import { VoidInterface } from "./src/interface";
import App from "./App";

let emitter = new VoidInterface();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(() => <App emitter={emitter} />);
