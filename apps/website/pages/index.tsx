// @generated: @expo/next-adapter@4.0.9
import React from "react";
import { Text, View } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Image from "next/image";

export default function App() {
	return (
		<View style={{ flex: 1, alignItems: "center" }}>
			<Image src="/favicon.png" width={256} height={256} />
			<Text
				style={{ color: "#fafafa", fontSize: 18, marginVertical: 45 }}
			>
				Decentralized. Private. Secure.
			</Text>
			<View
				style={{
					width: "80%",
					flexDirection: "row",
					justifyContent: "space-around",
				}}
			>
				<Image src="/android.png" width={236} height={512} />
				<Image src="/linux.png" width={568} height={512} />
			</View>
			<Text
				accessibilityRole="link"
				href="https://github.com/OzymandiasTheGreat/screamingvoid/releases"
				style={{
					color: "#efefef",
					fontSize: 32,
					marginVertical: 25,
				}}
			>
				Try Void today!
			</Text>
			<View
				style={{
					width: "80%",
					flexDirection: "row",
					justifyContent: "space-around",
					marginVertical: 25,
				}}
			>
				<Text
					accessibilityRole="link"
					href="https://github.com/OzymandiasTheGreat/screamingvoid"
					style={{ color: "#fafafa", fontSize: 16 }}
				>
					<Icon
						name="github"
						size={24}
						color="#efefef"
						style={{ textAlignVertical: "center" }}
					/>{" "}
					GitHub
				</Text>
				<Text
					accessibilityRole="link"
					href="https://discord.gg/7y547p7c"
					style={{ color: "#fafafa", fontSize: 16 }}
				>
					<Icon
						name="discord"
						size={24}
						color="#efefef"
						style={{ textAlignVertical: "center" }}
					/>{" "}
					Discord
				</Text>
			</View>
			<View
				style={{
					backgroundColor: "#424242",
					alignItems: "center",
					width: "100%",
					padding: 50,
				}}
			>
				<Text
					accessibilityRole="link"
					href="https://tomasrav.me/"
					style={{ color: "#efefef", fontSize: 16 }}
				>
					<Icon
						name="copyright"
						size={24}
						color="#efefef"
						style={{ textAlignVertical: "center" }}
					/>{" "}
					2022 - Tomas Ravinskas
				</Text>
			</View>
		</View>
	);
}
