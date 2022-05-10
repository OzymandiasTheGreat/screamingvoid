import React from "react";
import { SafeAreaView, Text } from "react-native";

export const Feed: React.FC = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text>'Tis the feed.</Text>
		</SafeAreaView>
	);
};
