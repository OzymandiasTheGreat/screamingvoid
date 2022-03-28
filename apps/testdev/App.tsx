import React from "react";
import { Button, SafeAreaView, StatusBar } from "react-native";
import utp from "@void/utp-native";

const App = () => {
	const runUTPTests = () => {
		require("@void/utp-native/test/net");
		require("@void/utp-native/test/udp");
		require("@void/utp-native/test/sockets");
	};
	const runUTPTimeoutTests = () => {
		require("@void/utp-native/test/timeouts");
	};

	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "space-around",
			}}>
			<Button title="Run UTP Tests" onPress={runUTPTests} />
			<Button
				title="Run UTP Timeout Tests"
				onPress={runUTPTimeoutTests}
			/>
			<StatusBar barStyle={"light-content"} />
		</SafeAreaView>
	);
};

export default App;
