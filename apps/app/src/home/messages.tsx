import { NavigationProp, RouteProp } from "@react-navigation/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type levelup from "levelup";
import React, { useContext, useEffect, useState } from "react";
import { Image, FlatList, SafeAreaView, Text, View } from "react-native";
import {
	Button,
	Dialog,
	FAB,
	List,
	Portal,
	TextInput,
} from "react-native-paper";
import sublevel from "subleveldown";
import { PrefsContext, VoidContext } from "../context";
import type { MessageList, Peer } from "../interface";
import { parsePeer } from "../util";

dayjs.extend(relativeTime);

export const Messages: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const prefs = useContext(PrefsContext);
	const [log, setLog] = useState<levelup.LevelUp>();
	const [convos, setConvos] = useState<MessageList>([]);
	const [unread, setUnread] = useState<boolean[]>([]);
	const [dialog, setDialog] = useState(false);
	const [peers, setPeers] = useState<Peer[]>([]);
	const [peer, setPeer] = useState("");
	const [name, setName] = useState("");
	const [current, setCurrent] = useState("");
	const [menu, setMenu] = useState(false);

	useEffect(() => {
		if ((route.params as any).id) {
			const participant = parsePeer((route.params as any).id.trim());
			emitter.once(["peer", participant], (peer) =>
				setPeers((prev) =>
					prev.map((participant) => {
						if (participant.id !== peer.id) {
							return participant;
						}
						participant.name = peer.name;
						participant.bio = peer.bio;
						return participant;
					})
				)
			);
			emitter.emit(["request", "peer"], participant);
			setPeers([{ id: participant }]);
			setDialog(true);
		}
	}, [route]);
	useEffect(() => {
		setLog(
			sublevel(prefs, "VOID_MESSAGE_LOG", {
				keyEncoding: "utf8",
				valueEncoding: "utf8",
			})
		);
	}, []);
	useEffect(() => {
		const listener = emitter.on(["conversation", "list"], async (data) => {
			setConvos(
				data.sort((a, b) => {
					const cmp =
						(b.last?.timestamp as any) - (a.last?.timestamp as any);
					if (isNaN(cmp)) {
						return -1000000;
					}
					return cmp;
				})
			);
			const status = [];
			for (let convo of data) {
				const last = await log?.get(convo.id).catch(() => null);
				if (!last) {
					status.push(true);
				} else {
					status.push((convo.last?.id.localeCompare(last) || 0) > 0);
				}
			}
			setUnread(status);
		});
		emitter.emit(
			["request", "conversation", "list"],
			(route.params as any).archived
		);
		return () => {
			(listener as any).off();
		};
	}, [log, route]);
	useEffect(() => {
		const listener = emitter.on(
			["conversation", "message", "*"],
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
				setConvos(
					list.sort((a, b) => {
						const cmp =
							(b.last?.timestamp as any) -
							(a.last?.timestamp as any);
						if (isNaN(cmp)) {
							return -1000000;
						}
						return cmp;
					})
				);
				setUnread(status);
			}
		);
		return () => {
			listener.off();
		};
	}, [convos, log]);
	useEffect(() => {
		const listener = emitter.on(["conversation", "new"], (id) => {
			emitter.emit(
				["request", "conversation", "list"],
				(route.params as any).archived
			);
		});
		return () => {
			listener.off();
		};
	}, [route]);
	useEffect(() => {
		const listener = emitter.on(
			["conversation", "archive", "*"],
			function (this: { event: string }, archived) {
				if (archived !== (route.params as any).archived) {
					const id = this.event.slice(this.event.lastIndexOf("."));
					setConvos((prev) => {
						const index = prev.findIndex((c) => c.id === id);
						if (index >= 0) {
							prev.splice(index, 1);
							return [...prev];
						}
						return prev;
					});
				}
			}
		);
		return () => {
			listener.off();
		};
	}, [route]);

	const showDialog = () => setDialog(true);
	const hideDialog = () => {
		setDialog(false);
		setPeers([]);
		setPeer("");
		setName("");
	};
	const addPeer = () => {
		try {
			const participant = parsePeer(peer.trim());
			emitter.once(["peer", participant], (peer) =>
				setPeers((prev) =>
					prev.map((participant) => {
						if (participant.id !== peer.id) {
							return participant;
						}
						participant.name = peer.name;
						participant.bio = peer.bio;
						return participant;
					})
				)
			);
			emitter.emit(["request", "peer"], participant);
			setPeers((prev) => [...prev, { id: participant }]);
			setPeer("");
		} catch (err) {
			console.log(err);
		}
	};
	const startConvo = () => {
		if (peers.length) {
			emitter.emit(["request", "start", "conversation"], {
				peers: peers.map((p) => p.id),
				name,
			});
		}
		hideDialog();
	};

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
			? `${item.last.sender.name}: ${item.last.body}`
			: "Write something...";
		const size = item.peers.length === 1 ? 48 : 24;
		const left = item.peers.map((p) => ({
			uri: emitter.getAvatar(p.id),
			width: size,
			height: size,
		}));
		const right = item.last
			? `${dayjs(item.last.timestamp).fromNow()}`
			: "";
		const onLongPress = () => {
			setCurrent(item.id);
			setMenu(true);
		};

		return (
			<List.Item
				key={item.id}
				onPress={() =>
					navigation.navigate("Conversation", { id: item.id })
				}
				onLongPress={onLongPress}
				titleStyle={{ fontWeight: unread[index] ? "700" : "400" }}
				descriptionStyle={{ fontWeight: unread[index] ? "700" : "400" }}
				descriptionNumberOfLines={1}
				descriptionEllipsizeMode="tail"
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
				right={(props) => (
					<Text {...props} style={{ color: "#777", width: 64 }}>
						{right}
					</Text>
				)}
			/>
		);
	};

	const renderPeer = ({ item }: { item: Peer }) => {
		return (
			<List.Item
				title={item.name || item.id}
				titleNumberOfLines={1}
				titleEllipsizeMode="middle"
				description={item.bio}
				descriptionNumberOfLines={1}
				descriptionEllipsizeMode="tail"
				left={(props) => (
					<Image
						{...props}
						source={{
							uri: emitter.getAvatar(item.id),
							width: 32,
							height: 32,
						}}
						borderRadius={16}
					/>
				)}
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
			<FAB
				icon="message-text"
				onPress={showDialog}
				style={{
					position: "absolute",
					bottom: 0,
					right: 0,
					margin: 25,
				}}
			/>
			<Portal>
				<Dialog visible={menu} onDismiss={() => setMenu(false)}>
					<Dialog.Content>
						<List.Item
							title={
								(route.params as any).archived
									? "Unarchive"
									: "Archive"
							}
							onPress={() => {
								setMenu(false);
								emitter.emit(
									["request", "conversation", "archive"],
									{
										id: current,
										archived: !(route.params as any)
											.archived,
									}
								);
							}}
						/>
						<List.Item
							title="Mute"
							onPress={() => {
								setMenu(false);
								setConvos((prev) =>
									prev.filter((c) => c.id !== current)
								);
								emitter.emit(
									["request", "conversation", "mute"],
									{ id: current, muted: true }
								);
							}}
						/>
					</Dialog.Content>
				</Dialog>
				<Dialog visible={dialog} onDismiss={hideDialog}>
					<Dialog.Title>New Conversation</Dialog.Title>
					<Dialog.Content>
						<TextInput
							label="Participant"
							value={peer}
							onChangeText={setPeer}
							right={
								<TextInput.Icon name="plus" onPress={addPeer} />
							}
							onSubmitEditing={addPeer}
						/>
						{peers.length > 1 && (
							<TextInput
								label="Name"
								value={name}
								onChangeText={setName}
							/>
						)}
						<FlatList data={peers} renderItem={renderPeer} />
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={hideDialog}>Cancel</Button>
						<Button onPress={startConvo}>Chat</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
};
