import React, { useEffect, useState } from "react";
import {
	Button,
	SafeAreaView,
	StatusBar,
	Text,
	View,
	useColorScheme,
} from "react-native";
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from "@notifee/react-native";
import type { EventEmitter2 } from "eventemitter2";

const App: React.FC<{ emitter: EventEmitter2 }> = ({ emitter }) => {
	const isDarkMode = useColorScheme() === "dark";
	const [count, setCount] = useState(0);

	useEffect(() => {
		notifee.createChannel({
			id: "service",
			name: "Void Network Service",
			importance: AndroidImportance.NONE,
			visibility: AndroidVisibility.PUBLIC,
		});
	}, []);
	useEffect(() => {
		const listener = (emitter as any).addListener(
			"run",
			(c: number) => setCount(c),
			{
				objectify: true,
			},
		);
		return () => listener.off();
	}, []);

	const show = () =>
		notifee.displayNotification({
			id: "service",
			body: "Connected to the Void network",
			title: "Void",
			android: {
				asForegroundService: true,
				channelId: "service",
			},
		});
	const hide = () => notifee.stopForegroundService();

	return (
		<SafeAreaView
			style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
			/>
			<Text>{count}</Text>
			<View
				style={{
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-around",
				}}>
				<Button title="Show" onPress={show}></Button>
				<Button title="Hide" onPress={hide}></Button>
				<Button
					title="Start"
					onPress={() => emitter.emit("start")}></Button>
				<Button
					title="Stop"
					onPress={() => emitter.emit("stop")}></Button>
				<Button
					title="Reset"
					onPress={() => emitter.emit("reset")}></Button>
			</View>
		</SafeAreaView>
	);
};

export default App;
