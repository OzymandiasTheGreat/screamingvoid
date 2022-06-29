import React, { useEffect, useState } from "react";
import { useColorScheme, StatusBar } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
	LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import notifee from "@notifee/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RNFS from "react-native-fs";
import path from "path";
import levelup from "levelup";
import leveldown from "leveldown";
import { navigationRef, VoidInterface } from "./src/interface";
import { PrefsContext, VoidContext } from "./src/context";
import { Login } from "./src/login";
import { Home } from "./src/home/home";
import { ChatRequests } from "./src/chat/requests";
import { Conversation } from "./src/chat/conversation";
import { EmojiStorage } from "./src/emoji-storage";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "./src/colors";

const Stack = createNativeStackNavigator();

const App: React.FC<{ emitter: VoidInterface }> = ({ emitter }) => {
	const scheme = useColorScheme();
	const [loaded, setLoaded] = useState(false);
	const [prefs, setPrefs] = useState<levelup.LevelUp>();

	const linking: LinkingOptions<{}> = {
		prefixes: [Linking.createURL("/")],
		config: {
			initialRouteName: "Home" as any,
			screens: {
				ChatRequests: "chat-requests",
				Conversation: "conversation/:id",
			},
		},
	};

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
	useEffect(
		() =>
			notifee.onForegroundEvent(({ detail, type }) => {
				switch (type) {
					case 1:
						switch (detail.pressAction?.id) {
							case "convo-requests":
								Linking.openURL(
									Linking.createURL("/chat-requests")
								);
								break;
							case "convo-message":
								Linking.openURL(
									Linking.createURL(
										`/conversation/${
											(detail.notification as any).data
												.conversation
										}`
									)
								);
								break;
						}
						break;
					case 2:
						switch (detail.pressAction?.id) {
							case "convo-accept":
								emitter.emit(
									["accept", "conversation"],
									detail.notification?.data?.id as string
								);
								break;
						}
						break;
				}
			}),
		[]
	);
	useEffect(() => {
		if (prefs) {
			const storage = new EmojiStorage(prefs);
			return () => storage.close();
		}
	}, [prefs]);

	return (
		<VoidContext.Provider value={emitter}>
			<PrefsContext.Provider value={prefs as any}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<PaperProvider>
						{loaded ? (
							<NavigationContainer
								ref={navigationRef}
								linking={linking}
								theme={
									scheme === "dark" ? DarkTheme : DefaultTheme
								}
							>
								<Stack.Navigator
									screenOptions={{ headerShown: false }}
								>
									<Stack.Screen
										name="Home"
										component={Home}
									/>
									<Stack.Screen
										name="ChatRequests"
										component={ChatRequests}
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
						<StatusBar
							translucent={true}
							barStyle={
								scheme === "dark"
									? "light-content"
									: "dark-content"
							}
							backgroundColor={
								scheme === "dark" ? PRIMARY_DARK : PRIMARY_LIGHT
							}
						/>
					</PaperProvider>
				</GestureHandlerRootView>
			</PrefsContext.Provider>
		</VoidContext.Provider>
	);
};

export default App;
