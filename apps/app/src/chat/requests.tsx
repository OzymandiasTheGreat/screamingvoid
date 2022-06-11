import React, { useContext, useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, View } from "react-native";
import { IconButton, List } from "react-native-paper";
import { VoidContext } from "../context";

type Request = {
	id: string;
	name: string;
	peers: { id: string; name?: string; bio?: string }[];
};

export const ChatRequests: React.FC = () => {
	const emitter = useContext(VoidContext);
	const [requests, setRequests] = useState<Request[]>([]);

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
