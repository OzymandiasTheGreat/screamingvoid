import React from "react";
import { SafeAreaView, StatusBar, Text, useColorScheme } from "react-native";

const App = () => {
	const isDarkMode = useColorScheme() === "dark";

	return (
		<SafeAreaView
			style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
			/>
			<Text>Hello, World!</Text>
		</SafeAreaView>
	);
};

export default App;
