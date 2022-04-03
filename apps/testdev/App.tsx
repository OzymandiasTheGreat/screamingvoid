import React from "react";
import { Button, SafeAreaView, StatusBar } from "react-native";
import RNFS from "react-native-fs";
import utp from "@screamingvoid/utp-native";
import Sodium from "@screamingvoid/sodium-universal";
import LevelTests from "@screamingvoid/leveldown/test";

const App = () => {
	const runUTPTests = () => {
		require("@screamingvoid/utp-native/test/net");
		require("@screamingvoid/utp-native/test/udp");
		require("@screamingvoid/utp-native/test/sockets");
	};
	const runUTPTimeoutTests = () => {
		require("@screamingvoid/utp-native/test/timeouts");
	};
	const runSodiumTests = () => {
		require("@screamingvoid/sodium-universal/test/sodium-test");
		require("@screamingvoid/sodium-universal/test/vectors");
	};
	const runLevelTests = () => LevelTests(RNFS.CachesDirectoryPath);

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
			<Button title="Run Sodium Tests" onPress={runSodiumTests} />
			<Button title="Run LevelDown Tests" onPress={runLevelTests} />
			<StatusBar barStyle={"light-content"} />
		</SafeAreaView>
	);
};

export default App;
