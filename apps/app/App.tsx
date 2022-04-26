import React, { useEffect, useState } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RNFS from "react-native-fs";
import { EventEmitter2 } from "eventemitter2";
import levelup from "levelup";
import leveldown from "leveldown";
import path from "path";
import { VoidContext } from "./src/ctx";
import { Login } from "./src/login";
import { HomeScreen } from "./src/home/home";
import { TestScreen } from "./src/test";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: EventEmitter2 }> = ({ emitter }) => {
	const [loaded, setLoaded] = useState(false);
	const [prefs, setPrefs] = useState<levelup.LevelUp>();

	useEffect(() => {
		const listener = emitter.on("loaded", setLoaded, { objectify: true });
		emitter.emit("isLoaded");
		return () => (listener as any).off();
	}, []);
	useEffect(() => {
		const prefs = levelup(
			leveldown(path.join(RNFS.DocumentDirectoryPath, "preferences")),
		);
		setPrefs(prefs);
		return () => {
			prefs.close();
		};
	}, []);

	return (
		<VoidContext.Provider value={emitter}>
			<PaperProvider>
				{loaded ? (
					<NavigationContainer>
						<Stack.Navigator screenOptions={{ headerShown: false }}>
							<Stack.Screen name="Home" component={HomeScreen} />
							<Stack.Screen name="Test" component={TestScreen} />
						</Stack.Navigator>
					</NavigationContainer>
				) : (
					<Login prefs={prefs as any} />
				)}
			</PaperProvider>
		</VoidContext.Provider>
	);
};

export default App;
