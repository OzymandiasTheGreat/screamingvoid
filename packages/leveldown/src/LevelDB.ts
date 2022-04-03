import { NativeModules, Platform } from "react-native";

// global func declaration for JSI functions
declare global {
	function nativeCallSyncHook(): unknown;
	var __LevelProxy: Record<string, any> | undefined;
}

// Check if the constructor exists. If not, try installing the JSI bindings.
if (global.__LevelProxy == null) {
	// Get the native Level ReactModule
	const LevelModule = NativeModules.Level;
	if (LevelModule == null) {
		let message =
			"Failed to install leveldown: The native `Level` Module could not be found.";
		message +=
			"\n* Make sure leveldown is correctly autolinked (run `npx react-native config` to verify)";
		if (Platform.OS === "ios" || Platform.OS === "macos") {
			message +=
				"\n* Make sure you ran `pod install` in the ios/ directory.";
		}
		if (Platform.OS === "android") {
			message += "\n* Make sure gradle is synced.";
		}
		// check if Expo
		const ExpoConstants =
			NativeModules.NativeUnimoduleProxy?.modulesConstants
				?.ExponentConstants;
		if (ExpoConstants != null) {
			if (ExpoConstants.appOwnership === "expo") {
				// We're running Expo Go
				throw new Error(
					"leveldown is not supported in Expo Go! Use EAS (`expo prebuild`) or eject to a bare workflow instead.",
				);
			} else {
				// We're running Expo bare / standalone
				message += "\n* Make sure you ran `expo prebuild`.";
			}
		}

		message += "\n* Make sure you rebuilt the app.";
		throw new Error(message);
	}

	// Check if we are running on-device (JSI)
	if (global.nativeCallSyncHook == null || LevelModule.install == null) {
		throw new Error(
			"Failed to install leveldown: React Native is not running on-device. Level can only be used when synchronous method invocations (JSI) are possible. If you are using a remote debugger (e.g. Chrome), switch to an on-device debugger (e.g. Flipper) instead.",
		);
	}

	// Call the synchronous blocking install() function
	const result = LevelModule.install();
	if (result !== true)
		throw new Error(
			`Failed to install leveldown: The native Level Module could not be installed! Looks like something went wrong when installing JSI bindings: ${result}`,
		);

	// Check again if the constructor now exists. If not, throw an error.
	if (global.__LevelProxy == null)
		throw new Error(
			"Failed to install leveldown, the native initializer function does not exist. Are you trying to use Level from different JS Runtimes?",
		);
}

export const Level = global.__LevelProxy;
