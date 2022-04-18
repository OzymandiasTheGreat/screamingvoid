import React, { useContext, useEffect, useState } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { EventEmitter2 } from "eventemitter2";

const Stack = createNativeStackNavigator();
const Tabs = createMaterialBottomTabNavigator();
const Context = React.createContext<EventEmitter2>(null as any);

const TestingTab: React.FC<{ navigation: NavigationProp<any> }> = ({
	navigation,
}) => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				height: "100vh",
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

const MessagesTab: React.FC = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				height: "100vh",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<Text>This is Your inbox!</Text>
		</SafeAreaView>
	);
};

const FeedTab: React.FC = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				height: "100vh",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<Text>This is Your feed.</Text>
		</SafeAreaView>
	);
};

const HomeScreen: React.FC<{ navigation: NavigationProp<any> }> = ({
	navigation,
}) => {
	return (
		<Tabs.Navigator>
			<Tabs.Screen name="TestTab" component={TestingTab} />
			<Tabs.Screen name="Messages" component={MessagesTab} />
			<Tabs.Screen name="Feed" component={FeedTab} />
		</Tabs.Navigator>
	);
};

const TestScreen: React.FC<{
	navigation: NavigationProp<any>;
}> = ({ navigation }) => {
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

	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "space-around",
			}}>
			<Text>{count}</Text>
			<View
				style={{
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-around",
				}}>
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
	return (
		<Context.Provider value={emitter}>
			<NavigationContainer>
				<Stack.Navigator screenOptions={{ headerShown: false }}>
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen name="Test" component={TestScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		</Context.Provider>
	);
};

export default App;
