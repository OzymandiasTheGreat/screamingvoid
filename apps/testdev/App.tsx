import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getFileDescriptor, FS } from "@screamingvoid/fs-next";
import { Buffer } from "buffer";

export default function App() {
	useEffect(() => {
		console.log(getFileDescriptor);
	}, []);

	return (
		<View style={styles.container}>
			<Text>Open up App.tsx to start working on your app!</Text>
			<Button
				title="Open File"
				onPress={() =>
					DocumentPicker.getDocumentAsync({
						copyToCacheDirectory: false,
					}).then((doc) => {
						if (doc.type === "success") {
							const fd = getFileDescriptor?.(doc.uri, "r");
							console.log(fd);
						}
					})
				}
			/>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
