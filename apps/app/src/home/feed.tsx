import React from "react";
import { SafeAreaView, Text } from "react-native";

export const FeedTab: React.FC = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}>
			<Text>This is Your feed.</Text>
		</SafeAreaView>
	);
};
