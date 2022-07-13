import { NavigationProp, RouteProp } from "@react-navigation/native";
import {
	NativeStackHeaderProps,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, View } from "react-native";
import { Appbar, IconButton, List, Menu } from "react-native-paper";
import { VoidContext } from "../context";

type Request = {
	id: string;
	name: string;
	peers: { id: string; name?: string; bio?: string }[];
};

const Header: React.FC<NativeStackHeaderProps> = ({ back, navigation }) => {
	const emitter = useContext(VoidContext);
	const [visible, setVisible] = useState(false);

	return (
		<Appbar.Header>
			{!!back && (
				<Appbar.BackAction onPress={() => navigation.goBack()} />
			)}
			<Appbar.Content title="Chat Requests" />
			<Menu
				visible={visible}
				onDismiss={() => setVisible(false)}
				anchor={
					<Appbar.Action
						icon={({ size }) => (
							<Image
								source={{
									uri: emitter.getAvatar(emitter.self.id),
									width: size,
									height: size,
								}}
								style={{ borderRadius: size / 2 }}
							/>
						)}
						onPress={() => setVisible(true)}
					/>
				}
			></Menu>
		</Appbar.Header>
	);
};

export const ChatRequests: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const [requests, setRequests] = useState<Request[]>([]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			header: (props) => <Header {...props} />,
		} as NativeStackNavigationOptions);
	}, [navigation, route]);
	useEffect(() => {
		const listener1 = emitter.on(["conversation", "requests"], (data) =>
			setRequests(data)
		);
		const listener2 = emitter.on(["conversation", "request"], () =>
			emitter.emit(["request", "conversation", "requests"])
		);
		emitter.emit(["request", "conversation", "requests"]);
		return () => {
			listener1.off();
			listener2.off();
		};
	}, [emitter]);

	const render = ({ item }: { item: Request }) => {
		const imgSize = item.peers.length === 1 ? 48 : 24;
		const sources = item.peers.slice(0, 4).map((p) => ({
			uri: emitter.getAvatar(p.id),
			width: imgSize,
			height: imgSize,
		}));
		return (
			<List.Item
				key={item.id}
				title={
					item.peers.length > 1
						? item.name
						: item.peers[0].name || item.peers[0].id
				}
				description={
					item.peers.length > 1
						? item.peers.map((p) => p.name || p.id).join(", ")
						: ""
				}
				right={(props) => (
					<IconButton
						{...props}
						icon="check"
						onPress={() =>
							emitter.emit(["accept", "conversation"], item.id)
						}
					/>
				)}
				left={(props) => (
					<View
						{...props}
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							alignItems: "center",
							justifyContent: "center",
							width: 48,
							height: 48,
						}}
					>
						{sources.map((source) => (
							<Image
								key={source.uri}
								source={source}
								style={{ borderRadius: imgSize / 2 }}
							/>
						))}
					</View>
				)}
			></List.Item>
		);
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList data={requests} renderItem={render} />
		</SafeAreaView>
	);
};
