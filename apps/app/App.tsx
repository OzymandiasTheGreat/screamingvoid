import React, { useContext, useEffect, useState } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from "@notifee/react-native";
import { EventEmitter2 } from "eventemitter2";

const Stack = createNativeStackNavigator();
const Context = React.createContext<EventEmitter2>(null as any);

const HomeScreen: React.FC<{ navigation: NavigationProp<any> }> = ({
	navigation,
}) => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}>
			<Button
				title="Go to Testing"
				onPress={() => navigation.navigate("Test")}
			/>
		</SafeAreaView>
	);
};

const TestScreen: React.FC<{ navigation: NavigationProp<any> }> = ({
	navigation,
}) => {
	const emitter = useContext(Context);
	const [count, setCount] = useState(0);

	useEffect(() => {
		const listener = (emitter as any).on(
			"run",
			(c: number) => setCount(c),
			{ objectify: true },
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
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "space-around",
			}}>
			<Text style={{ color: "#0000ff" }}>{count}</Text>
			<View
				style={{
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-around",
				}}>
				<Button title="Show" onPress={show} />
				<Button title="Hide" onPress={hide} />
				<Button title="Start" onPress={() => emitter.emit("start")} />
				<Button title="Stop" onPress={() => emitter.emit("stop")} />
				<Button title="Reset" onPress={() => emitter.emit("reset")} />
			</View>
			<Button
				title="Go Back"
				onPress={() => navigation.navigate("Home")}
			/>
		</SafeAreaView>
	);
};

const App: React.FC<{ emitter: EventEmitter2 }> = ({ emitter }) => {
	useEffect(() => {
		notifee.createChannel({
			id: "service",
			name: "Void Network Service",
			importance: AndroidImportance.NONE,
			visibility: AndroidVisibility.PUBLIC,
		});
	}, []);

	return (
		<Context.Provider value={emitter}>
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen name="Test" component={TestScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		</Context.Provider>
	);
};

export default App;
