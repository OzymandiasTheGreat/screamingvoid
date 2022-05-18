import React, { useEffect, useState } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { VoidInterface } from "./src/interface";
import { VoidContext } from "./src/context";
import { Login } from "./src/login";
import { Home } from "./src/home/home";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: VoidInterface }> = ({ emitter }) => {
	const [ready, setReady] = useState(false);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const listener = emitter.on(["backend", "ready"] as any, () => {
			setReady(true);
		});
		return () => {
			listener.off();
		};
	}, []);

	useEffect(() => {
		const listener = emitter.on("loaded", setLoaded);
		emitter.emit(["is", "loaded"]);
		return () => {
			listener.off();
		};
	}, []);

	if (!ready) {
		return null;
	}

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
					<Login />
				)}
			</PaperProvider>
		</VoidContext.Provider>
	);
};

export default App;
