import React from "react";
import { SafeAreaView } from "react-native";
import { Text } from "react-native-paper";

export const Contacts: React.FC = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text>You don't have to like these people!</Text>
		</SafeAreaView>
	);
};
