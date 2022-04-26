import React, { useContext, useEffect, useState } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { VoidContext } from "./ctx";

export const TestScreen: React.FC<{ navigation: NavigationProp<any> }> = ({
	navigation,
}) => {
	const emitter = useContext(VoidContext);
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
			<Text style={{ color: "#212121" }}>{count}</Text>
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
