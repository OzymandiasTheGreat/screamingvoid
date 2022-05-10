import React, { useEffect, useState } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RNFS from "react-native-fs";
import path from "path";
import levelup from "levelup";
import leveldown from "leveldown";
import { VoidInterface } from "./src/interface";
import { VoidContext } from "./src/context";
import { Login } from "./src/login";
import { Home } from "./src/home/home";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: VoidInterface }> = ({ emitter }) => {
	const [loaded, setLoaded] = useState(false);
	const [prefs, setPrefs] = useState<levelup.LevelUp>();

	useEffect(() => {
		const listener = emitter.on("loaded", setLoaded);
		emitter.emit(["is", "loaded"]);
		return () => {
			listener.off();
		};
	}, []);
	useEffect(() => {
		const prefs = levelup(
			leveldown(path.join(RNFS.DocumentDirectoryPath, "preferences"))
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
						<Stack.Navigator>
							<Stack.Screen name="Home" component={Home} />
						</Stack.Navigator>
					</NavigationContainer>
				) : (
					<Login prefs={prefs} />
				)}
			</PaperProvider>
		</VoidContext.Provider>
	);
};

export default App;
