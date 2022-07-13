import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	NavigationContainer,
	DarkTheme,
	DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { VoidInterface } from "./src/interface";
import { VoidContext } from "./src/context";
import { Login } from "./src/login";
import { Home } from "./src/home/home";
import { ChatRequests } from "./src/chat/requests";
import { MutedConversations } from "./src/chat/muted";
import { Conversation } from "./src/chat/conversation";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: VoidInterface }> = ({ emitter }) => {
	const dark = useColorScheme() === "dark";
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
			<GestureHandlerRootView
				style={{ flex: 1, overflow: "hidden" }}
				onContextMenu={(e: any) => e.preventDefault()}
			>
				<PaperProvider>
					{loaded ? (
						<NavigationContainer
							theme={dark ? DarkTheme : DefaultTheme}
						>
							<Stack.Navigator>
								<Stack.Screen name="Home" component={Home} />
								<Stack.Screen
									name="ChatRequests"
									component={ChatRequests}
								/>
								<Stack.Screen
									name="MutedChats"
									component={MutedConversations}
								/>
								<Stack.Screen
									name="Conversation"
									component={Conversation}
								/>
							</Stack.Navigator>
						</NavigationContainer>
					) : (
						<Login />
					)}
				</PaperProvider>
			</GestureHandlerRootView>
		</VoidContext.Provider>
	);
};

export default App;
