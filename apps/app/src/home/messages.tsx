import levelup from "levelup";
import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "react-native";
import { FlatList, SafeAreaView, Text } from "react-native";
import { List } from "react-native-paper";
import sublevel from "subleveldown";
import { PrefsContext, VoidContext } from "../context";
import type { MessageList } from "../interface";

export const Messages: React.FC = () => {
	const emitter = useContext(VoidContext);
	const prefs = useContext(PrefsContext);
	const [log, setLog] = useState<levelup.LevelUp>();
	const [convos, setConvos] = useState<MessageList>([]);
	const [unread, setUnread] = useState<boolean[]>([]);

	useEffect(() => {
		setLog(
			sublevel(prefs, "VOID_MESSAGE_LOG", {
				keyEncoding: "utf8",
				valueEncoding: "utf8",
			})
		);
	}, []);
	useEffect(() => {
		const listener1 = emitter.on(["conversation", "list"], async (data) => {
			setConvos(data);
			const status = [];
			for (let msg of data) {
				const last = await log?.get(msg.id).catch(() => null);
				if (!last) {
					status.push(true);
				} else {
					status.push(msg.id.localeCompare(last) > 0);
				}
			}
			setUnread(status);
		});
		const listener2 = emitter.on(
			["conversation", "message"],
			async (data) => {
				const list = [...convos];
				const status = [...unread];
				const index = list.findIndex((c) => c.id === data.conversation);
				if (index > -1) {
					status[index] =
						data.message.id.localeCompare(
							await log?.get(data.conversation).catch(() => null)
						) > 0;
					list[index].last = {
						id: data.message.id,
						body: data.message.body,
						sender: data.message.sender,
						timestamp: data.message.timestamp,
					};
				}
				setConvos(list);
				setUnread(status);
			}
		);
		emitter.emit(["request", "conversation", "list"]);
		return () => {
			listener1.off();
			listener2.off();
		};
	}, [convos, log]);

	const render = ({
		item,
		index,
	}: {
		item: MessageList[0];
		index: number;
	}) => {
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
				titleStyle={{ fontWeight: unread[index] ? "700" : "400" }}
				descriptionStyle={{ fontWeight: unread[index] ? "700" : "400" }}
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
								key={source.uri}
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
			}}
		>
			<FlatList data={convos} renderItem={render} />
		</SafeAreaView>
	);
};
