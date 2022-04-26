import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { EventEmitter2 } from "eventemitter2";
import { VoidContext } from "./src/ctx";
import { HomeScreen } from "./src/home/home";
import { TestScreen } from "./src/test";
import { Login } from "./src/login";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: EventEmitter2 }> = ({ emitter }) => {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const listener = emitter.on("loaded", setLoaded, { objectify: true });
		emitter.emit("isLoaded");
		return () => (listener as any).off();
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
					<Login prefs={undefined as any} />
				)}
			</PaperProvider>
		</VoidContext.Provider>
	);
};

export default App;
