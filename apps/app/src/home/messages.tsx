import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "react-native";
import { FlatList, SafeAreaView, Text } from "react-native";
import { List } from "react-native-paper";
import { VoidContext } from "../context";
import type { MessageList } from "../interface";

export const Messages: React.FC = () => {
	const emitter = useContext(VoidContext);
	const [convos, setConvos] = useState<MessageList>([]);

	useEffect(() => {
		const listener = emitter.on(["conversation", "list"], setConvos);
		emitter.emit(["request", "conversation", "list"]);
		return () => {
			listener.off();
		};
	}, []);

	const render = ({ item }: { item: MessageList[0] }) => {
		const name =
			item.peers.length === 1
				? item.peers[0].name || item.peers[0].id
				: item.name;
		const desc = item.last
			? `${item.last.sender.name}: ${item.last.body.slice(0, 64)}`
			: "Write something...";
		const size = item.peers.length === 1 ? 48 : 24;
		const left = item.peers.map((p) => ({
			uri: emitter.getAvatar(p.id),
			width: size,
			height: size,
		}));
		const right = item.last
			? `${new Date(item.last.timestamp).toLocaleTimeString()}`
			: "";
		return (
			<List.Item
				key={item.id}
				title={name}
				description={desc}
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
						{left.map((source) => (
							<Image
								source={source}
								style={{ borderRadius: size / 2 }}
							/>
						))}
					</View>
				)}
				right={(props) => <Text {...props}>{right}</Text>}
			/>
		);
	};

	return (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<FlatList data={convos} renderItem={render} />
		</SafeAreaView>
	);
};
