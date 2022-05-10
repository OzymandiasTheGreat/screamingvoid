import React from "react";
import { SafeAreaView, Text } from "react-native";

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
