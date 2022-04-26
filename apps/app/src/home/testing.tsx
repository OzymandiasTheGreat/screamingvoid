import React from "react";
import { Button, SafeAreaView } from "react-native";
import { NavigationProp } from "@react-navigation/native";

export const TestingTab: React.FC<{ navigation: NavigationProp<any> }> = ({
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
