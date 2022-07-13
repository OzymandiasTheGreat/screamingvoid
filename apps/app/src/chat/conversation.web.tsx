import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import {
	NavigationProp,
	RouteProp,
	DefaultTheme,
} from "@react-navigation/native";
import { fs, dialog, path as tauriPath, tauri } from "@tauri-apps/api";
import emojiRegex from "emoji-regex";
import * as Clipboard from "expo-clipboard";
import path from "path";
import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useWindowDimensions, TouchableOpacity, View } from "react-native";
import {
	GiftedChat,
	Bubble,
	Composer,
	InputToolbar,
	Send,
	InputToolbarProps,
	ComposerProps,
	SendProps,
	Time,
	Actions,
} from "react-native-gifted-chat";
import type { IMessage, BubbleProps } from "react-native-gifted-chat";
import { Modalize } from "react-native-modalize";
import {
	Appbar,
	Button,
	Dialog,
	IconButton,
	List,
	Menu,
	Provider,
	Text,
	TextInput,
} from "react-native-paper";
import { VoidContext } from "../context";
import { FlatList } from "react-native";
import { useColorScheme } from "react-native";
import { SwipeRow } from "react-native-swipe-list-view";
import { imageURIs } from "../util";
import { ChatMessage, Peer } from "../interface";
import {
	PRIMARY_BLUE,
	PRIMARY_DARK,
	PRIMARY_LIGHT,
	SECONDARY_BLUE,
	SECONDARY_DARK,
	SECONDARY_LIGHT,
	TRANSPARENT,
} from "../colors";
import { Image } from "react-native";
import { Profile } from "../shared/profile";
import {
	NativeStackHeaderProps,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { Palette } from "../shared/emoji";

interface Message extends IMessage {
	reaction: { sender: { id: string; name: string }; char: string }[];
	attachments: string[];
	replyingTo?: Message;
}

interface ReplyingTo {
	id: string;
	avatar: string;
}

const Header: React.FC<
	NativeStackHeaderProps & {
		participants: React.RefObject<Modalize>;
		showRename: () => void;
	}
> = ({ back, navigation, route, participants, showRename }) => {
	const emitter = useContext(VoidContext);
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState(route.name);
	const [canRename, setCanRename] = useState(false);

	useEffect(() => {
		const listener = emitter.on(
			["conversation", "rename", (route.params as any).id],
			(name) => setTitle(name)
		);
		return () => {
			listener.off();
		};
	}, [route]);
	useEffect(() => {
		const listener = emitter.once(
			["conversation", "meta", (route.params as any).id],
			({ name, peers }) => {
				if (name && peers.length > 2) {
					setCanRename(true);
					return setTitle(name);
				}
				const other = peers.filter(
					(p: string) => p !== emitter.self.id
				)[0];
				emitter.once(["peer", other], ({ name }) => setTitle(name));
				emitter.emit(["request", "peer"], other);
			},
			{ objectify: true }
		);
		emitter.emit(
			["request", "conversation", "meta"],
			(route.params as any).id
		);
		return () => {
			(listener as any).off();
		};
	}, [route]);

	const showParticipants = () => {
		participants.current?.open();
		setVisible(false);
	};

	return (
		<Appbar.Header>
			{!!back && (
				<Appbar.BackAction onPress={() => navigation.goBack()} />
			)}
			<Appbar.Content title={title} />
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
			>
				<Menu.Item
					title="Participants"
					icon="account-multiple"
					onPress={showParticipants}
				/>
				{canRename && (
					<Menu.Item
						title="Rename Conversation"
						icon="pen"
						onPress={() => {
							showRename();
							setVisible(false);
						}}
					/>
				)}
			</Menu>
		</Appbar.Header>
	);
};

const CustomBubble = (
	props: BubbleProps<Message> & {
		convo: string;
		reactions: React.RefObject<Modalize>;
		context: React.RefObject<Modalize>;
		setCurrent: (msg?: Message) => void;
		setReplying: (data: ReplyingTo) => void;
	}
) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [pressed, setPressed] = useState(false);
	const [reaction, setReaction] = useState<Record<string, number>>({});
	const [downloadDir, setDownloadDir] = useState("");

	useEffect(() => {
		const reaction: Record<string, number> = {};
		for (let react of props.currentMessage?.reaction || []) {
			if (reaction[react.char]) {
				++reaction[react.char];
			} else {
				reaction[react.char] = 1;
			}
		}
		setReaction(reaction);
	}, [props]);
	useEffect(() => {
		tauriPath.downloadDir().then(setDownloadDir);
	}, []);

	const isEmoji = (text?: string) => {
		const trimmed = text?.trim();
		if (trimmed) {
			const match = [...trimmed.matchAll(emojiRegex())];
			if (match.length) {
				if (match[0][0].length === trimmed.length) {
					return true;
				}
			}
		}
		return false;
	};

	const saveAttachment = (attachment: string) => {
		emitter.once(
			["conversation", "attachment", props.currentMessage?._id as string],
			(uri) => {
				dialog
					.save({
						defaultPath: downloadDir,
						title: "Save Attachment",
					})
					.then((filepath) => {
						if (filepath) {
							fs.copyFile(uri.slice("file://".length), filepath);
						}
					});
			}
		);
		emitter.emit(["request", "attachment"], {
			attachment,
			message: props.currentMessage?._id as string,
			convo: props.convo,
		});
	};

	return (
		<SwipeRow
			disableLeftSwipe={props.position === "left"}
			disableRightSwipe={props.position === "right"}
			leftActivationValue={64}
			rightActivationValue={64}
			onLeftAction={() =>
				props.setReplying?.({
					id: props.currentMessage?._id as any,
					avatar: props.currentMessage?.user.avatar as any,
				})
			}
			onRightAction={() =>
				props.setReplying?.({
					id: props.currentMessage?._id as any,
					avatar: props.currentMessage?.user.avatar as any,
				})
			}
		>
			<View
				style={{
					flex: 1,
					alignItems:
						props.position === "left" ? "flex-start" : "flex-end",
					justifyContent: "center",
				}}
			>
				<Icon
					name="reply"
					size={32}
					color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
				/>
			</View>
			<View
				onContextMenu={(e) => {
					e.preventDefault();
					props.setCurrent(props.currentMessage);
					props.context.current?.open();
				}}
			>
				{!!props.currentMessage?.replyingTo && (
					<Bubble
						{...props}
						currentMessage={props.currentMessage.replyingTo}
						nextMessage={undefined}
						previousMessage={undefined}
						containerStyle={{
							left: {
								backgroundColor: dark
									? "#000"
									: DefaultTheme.colors.background,
							},
							right: {
								backgroundColor: dark
									? "#000"
									: DefaultTheme.colors.background,
							},
						}}
						wrapperStyle={{
							left: {
								backgroundColor: dark
									? PRIMARY_DARK
									: PRIMARY_LIGHT,
							},
							right: {
								backgroundColor: SECONDARY_BLUE,
								opacity: 0.3,
							},
						}}
						textStyle={{
							left: {
								color: dark ? PRIMARY_LIGHT : PRIMARY_DARK,
								opacity: 0.3,
								padding: 5,
							},
							right: {
								padding: 5,
							},
						}}
						renderTime={() => <></>}
						renderUsernameOnMessage
					/>
				)}
				<Bubble
					{...props}
					containerStyle={{
						left: {
							backgroundColor: dark
								? "#000"
								: DefaultTheme.colors.background,
						},
						right: {
							backgroundColor: dark
								? "#000"
								: DefaultTheme.colors.background,
						},
					}}
					wrapperStyle={{
						left: {
							backgroundColor: isEmoji(props.currentMessage?.text)
								? TRANSPARENT
								: dark
								? SECONDARY_DARK
								: SECONDARY_LIGHT,
						},
						right: {
							backgroundColor: isEmoji(props.currentMessage?.text)
								? TRANSPARENT
								: PRIMARY_BLUE,
						},
					}}
					textStyle={{
						left: {
							color: dark ? PRIMARY_LIGHT : PRIMARY_DARK,
							padding: 5,
							fontSize: isEmoji(props.currentMessage?.text)
								? 48
								: 14,
							lineHeight: isEmoji(props.currentMessage?.text)
								? 56
								: 24,
						},
						right: {
							padding: 5,
							fontSize: isEmoji(props.currentMessage?.text)
								? 48
								: 14,
							lineHeight: isEmoji(props.currentMessage?.text)
								? 56
								: 24,
						},
					}}
					onPress={() => setPressed(!pressed)}
					onLongPress={() => {
						props.setCurrent(props.currentMessage);
						props.context.current?.open();
					}}
					renderTime={
						pressed
							? (tp: any) => (
									<Time
										{...tp}
										timeTextStyle={{
											left: { paddingHorizontal: 8 },
											right: { paddingHorizontal: 8 },
										}}
									/>
							  )
							: () => <></>
					}
					renderCustomView={() => (
						<View>
							<View>
								{props.currentMessage?.attachments.map((a) => (
									<List.Item
										key={a}
										title={a}
										titleEllipsizeMode="middle"
										left={(props) => (
											<List.Icon {...props} icon="file" />
										)}
										style={{ width: 250 }}
										onPress={() => saveAttachment(a)}
									/>
								))}
							</View>
							<View
								style={{
									flexDirection: "row",
									justifyContent:
										props.position === "left"
											? "flex-start"
											: "flex-end",
									paddingHorizontal: 10,
								}}
							>
								{Object.entries(reaction).map(([char, num]) => (
									<Text
										key={char}
										style={{
											color:
												props.position === "right"
													? PRIMARY_LIGHT
													: dark
													? PRIMARY_LIGHT
													: PRIMARY_DARK,
											backgroundColor:
												props.position === "right"
													? PRIMARY_LIGHT + "55"
													: dark
													? PRIMARY_LIGHT + "55"
													: PRIMARY_DARK + "55",
											padding: 2,
											borderRadius: 16,
											marginBottom: 3,
										}}
										onPress={() => {
											props.setCurrent(
												props.currentMessage
											);
											props.reactions.current?.open();
										}}
									>
										{num === 1 ? char : `${char} ${num}`}
									</Text>
								))}
							</View>
						</View>
					)}
					isCustomViewBottom={true}
				/>
			</View>
		</SwipeRow>
	);
};

const CustomToolbar = (
	props: InputToolbarProps<Message> & {
		convo: string;
		attachments: string[];
		setAttachments: (a: string[] | ((prev: string[]) => string[])) => void;
		replying?: ReplyingTo;
		setReplying: (r?: ReplyingTo) => void;
	}
) => {
	const dark = useColorScheme() === "dark";
	const { width, height } = useWindowDimensions();
	const emitter = useContext(VoidContext);
	const [text, setText] = useState("");
	const [selection, setSelection] = useState<{ start: number; end: number }>({
		start: 0,
		end: 0,
	});
	const [emojiPicker, setEmojiPicker] = useState(false);

	const send = () => {
		emitter.emit(["request", "send"], {
			id: props.convo,
			body: text,
			attachments: props.attachments,
			target: props.replying?.id,
		});
		setText("");
		props.setAttachments([]);
		props.setReplying();
	};

	const insertEmoji = (e: string) => {
		setText(
			(text) =>
				text.slice(0, selection.start) +
				`${e} ` +
				text.slice(selection.end)
		);
	};

	const renderComposer = (cprops: ComposerProps) => (
		<View
			style={{
				flexDirection: "row",
				width: text
					? width - (props.replying ? 144 : 96)
					: width - (props.replying ? 96 : 48),
				backgroundColor: SECONDARY_LIGHT,
				borderRadius: 32,
				marginHorizontal: 10,
			}}
		>
			{!!props.replying && (
				<TouchableOpacity
					onPress={() => props.setReplying()}
					style={{
						width: 48,
						height: 48,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Image
						source={{
							uri: props.replying.avatar,
							width: 24,
							height: 24,
						}}
						style={{ borderRadius: 12 }}
					/>
				</TouchableOpacity>
			)}
			<Composer
				{...cprops}
				text={text}
				onTextChanged={(text) => {
					cprops.onTextChanged?.(text);
					setText(text);
				}}
				textInputProps={{
					autoFocus: true,
					selection,
					onSelectionChange: (e) =>
						setSelection(e.nativeEvent.selection),
					onKeyPress: (e) => {
						if (e.nativeEvent.key === "Enter" && text) {
							e.preventDefault();
							send();
						}
					},
				}}
			/>
			<Palette
				visible={emojiPicker}
				onDismiss={() => setEmojiPicker(false)}
				onPress={insertEmoji}
				anchor={
					<IconButton
						icon="emoticon"
						size={24}
						color={PRIMARY_BLUE}
						onPress={() => setEmojiPicker(true)}
					/>
				}
			/>
		</View>
	);

	const renderSend = (sprops: SendProps<Message>) => (
		<Send
			{...sprops}
			onSend={send}
			containerStyle={{
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Icon name="send" size={32} color={PRIMARY_BLUE} />
		</Send>
	);

	const renderAttachment = ({ item }: { item: string }) => (
		<List.Item
			title={path.basename(item)}
			left={(props) => {
				if (/\.(gif|jpe?g|png)$/g.test(item)) {
					return (
						<Image
							{...props}
							source={{
								uri: item,
								width: 24,
								height: 32,
							}}
						/>
					);
				}
				return <List.Icon {...props} icon="file" />;
			}}
			right={(rprops) => (
				<IconButton
					{...rprops}
					icon="close"
					onPress={() =>
						props.setAttachments((a) => {
							a.splice(a.indexOf(item), 1);
							return [...a];
						})
					}
				/>
			)}
		/>
	);

	return (
		<InputToolbar
			{...props}
			containerStyle={{
				backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				paddingVertical: 3,
			}}
			accessoryStyle={{ height: props.attachments.length * 48 }}
			renderComposer={renderComposer}
			renderSend={renderSend}
			renderAccessory={
				props.attachments.length
					? (aprops) => (
							<FlatList
								{...aprops}
								data={props.attachments}
								renderItem={renderAttachment}
							/>
					  )
					: undefined
			}
		/>
	);
};

const Participants = React.forwardRef<
	Modalize,
	{
		id: string;
		profile: React.RefObject<Modalize>;
		setUser: (user: Message["user"]) => void;
	}
>(({ id, profile, setUser }, ref) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [peers, setPeers] = useState<Peer[]>([]);

	useEffect(() => {
		const peerListeners: any[] = [];
		const listener = emitter.once(
			["conversation", "meta", id],
			(meta) => {
				for (let pid of meta.peers) {
					peerListeners.push(
						emitter.once(
							["peer", pid],
							(p) => setPeers((prev) => [...prev, p]),
							{ objectify: true }
						)
					);
					emitter.emit(["request", "peer"], pid);
				}
			},
			{ objectify: true }
		);
		emitter.emit(["request", "conversation", "meta"], id);
		return () => {
			(listener as any).off();
			peerListeners.forEach((l) => l.off());
		};
	}, [id]);

	const showProfile = (id: string) => {
		setUser({ _id: id, avatar: emitter.getAvatar(id) });
		profile.current?.open();
	};

	const renderPeer = ({ item }: { item: Peer }) => (
		<List.Item
			title={item.name || item.id}
			onPress={() => showProfile(item.id)}
			left={(props) => (
				<List.Icon
					{...props}
					icon={({ size }) => (
						<Image
							source={{
								uri: emitter.getAvatar(item.id),
								width: size,
								height: size,
							}}
							style={{ borderRadius: size / 2 }}
						/>
					)}
				/>
			)}
		/>
	);

	return (
		<Modalize
			ref={ref}
			flatListProps={{
				data: peers,
				renderItem: renderPeer,
			}}
			withHandle={false}
			childrenStyle={{
				backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
			}}
		/>
	);
});

export const Conversation: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";

	const [rename, setRename] = useState(false);
	const [newName, setNewName] = useState("");

	const [messages, setMessages] = useState<Message[]>([]);
	const [current, setCurrent] = useState<Message | null | undefined>(null);
	const [loading, setLoading] = useState(false);

	const reactions = useRef<Modalize>(null);
	const context = useRef<Modalize>(null);
	const profile = useRef<Modalize>(null);
	const participants = useRef<Modalize>(null);
	const [currentUser, setCurrentUser] = useState<Message["user"]>();

	const [attachments, setAttachments] = useState<string[]>([]);
	const [customReaction, setCustomReaction] = useState(false);
	const [replying, setReplying] = useState<ReplyingTo>();

	const [pictureDir, setPictureDir] = useState("");

	const messageMapper = (
		message: ChatMessage | undefined,
		index: number,
		messages: (ChatMessage | Message)[]
	): Message | undefined => {
		if (message) {
			const images = imageURIs(message.body);
			const preview = message.attachments.find((a) =>
				/\.(?:gif|jpe?g|png)$/.test(a)
			);
			const replyingTo = !!(messages[0] as Message)?._id
				? (messages.find(
						(m) => (m as Message)._id === message.target
				  ) as Message)
				: messageMapper(
						messages.find(
							(m) => (m as ChatMessage).id === message.target
						) as ChatMessage,
						0,
						[]
				  );
			if (!images.length && preview) {
				emitter.once(["conversation", "attachment", message.id], (a) =>
					setMessages((prev) =>
						[...prev].map((m) => {
							if (m._id !== message.id) {
								return m;
							}
							m.image = tauri.convertFileSrc(
								a.slice("file://".length)
							);
							return m;
						})
					)
				);
				emitter.emit(["request", "attachment"], {
					attachment: preview,
					message: message.id,
					convo: (route.params as any).id,
				});
			}
			return {
				_id: message.id,
				createdAt: message.timestamp,
				user: {
					_id: message.sender.id,
					name: message.sender.name,
					avatar: emitter.getAvatar(message.sender.id),
				},
				text: message.body,
				image: images[0],
				reaction: message.reaction,
				attachments: message.attachments,
				replyingTo,
			};
		}
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			header: (props) => (
				<Header
					{...props}
					participants={participants}
					showRename={() => setRename(true)}
				/>
			),
		} as NativeStackNavigationOptions);
	}, [navigation, route]);
	useEffect(() => {
		tauriPath.pictureDir().then(setPictureDir);
	}, []);
	useEffect(() => {
		const listener1 = emitter.on(
			["conversation", (route.params as any).id as string],
			(msgs) => {
				setMessages((prev) =>
					GiftedChat.prepend(
						prev,
						msgs.map(messageMapper).filter((m) => !!m) as Message[]
					)
				);
				setLoading(false);
				localStorage.setItem(
					(route.params as any).id,
					msgs[0]?.id || ""
				);
			}
		);
		const listener2 = emitter.on(
			["conversation", "message", (route.params as any).id],
			(msg) => {
				setMessages((prev) => {
					return GiftedChat.append(
						prev,
						[
							messageMapper(msg.message, 0, messages) as Message,
						].filter((m) => !!m)
					);
				});
				localStorage.setItem((route.params as any).id, msg.message.id);
			}
		);
		const listener3 = emitter.on(
			["conversation", "react", (route.params as any).id],
			(data) => {
				setMessages((msgs) =>
					msgs.map((msg) => {
						if (msg._id !== data.target) {
							return msg;
						}
						const reaction = msg.reaction.find(
							(r) => r.sender.id === data.sender.id
						);
						if (reaction) {
							if (data.reaction) {
								reaction.char = data.reaction;
							} else {
								msg.reaction.splice(
									msg.reaction.indexOf(reaction),
									1
								);
							}
						} else if (data.reaction) {
							msg.reaction.push({
								char: data.reaction,
								sender: data.sender as any,
							});
						}
						return msg;
					})
				);
			}
		);
		const listener4 = emitter.on(
			["conversation", "remove", (route.params as any).id as string],
			(message) =>
				setMessages((messages) =>
					messages.filter((m) => m._id !== message)
				)
		);
		return () => {
			listener1?.off();
			listener2.off();
			listener3.off();
			listener4.off();
		};
	}, []);
	useEffect(() => {
		emitter.emit(
			["request", "conversation", (route.params as any).id as string],
			{}
		);
	}, []);

	const react = (reaction: string) => {
		emitter.emit(["request", "react"], {
			convo: (route.params as any).id,
			message: current?._id as string,
			reaction,
		});
		context.current?.close();
		setCustomReaction(false);
	};

	const remove = () => {
		emitter.emit(["request", "conversation", "remove"], {
			conversation: (route.params as any).id,
			message: current?._id as string,
		});
		context.current?.close();
	};

	const loadEarlier = () => {
		setLoading(true);
		emitter.emit(
			["request", "conversation", (route.params as any).id as string],
			{ last: messages[messages.length - 1]?._id as string }
		);
	};

	const renameConvo = () => {
		if (newName) {
			emitter.emit(["request", "conversation", "rename"], {
				id: (route.params as any).id,
				name: newName,
			});
			setRename(false);
		}
	};
	const renameCancel = () => {
		setNewName("");
		setRename(false);
	};

	return (
		<Provider>
			<View style={{ flex: 1 }}>
				<GiftedChat
					user={{ _id: emitter.self.id, name: emitter.self.name }}
					messages={messages}
					imageStyle={{ margin: 7 }}
					messagesContainerStyle={{
						paddingBottom: 7 + attachments.length * 48,
					}}
					onPressActionButton={() =>
						dialog
							.open({
								title: "Attach File",
								multiple: true,
								defaultPath: pictureDir,
							})
							.then((docs: any) => {
								if (docs) {
									setAttachments((a) => [...docs, ...a]);
								}
							})
					}
					onPressAvatar={(user) => {
						setCurrentUser(user);
						profile.current?.open();
					}}
					loadEarlier
					onLoadEarlier={loadEarlier}
					isLoadingEarlier={loading}
					infiniteScroll
					renderActions={(props) => (
						<Actions
							{...props}
							icon={() => (
								<Icon
									name="paperclip"
									size={32}
									color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
								/>
							)}
						/>
					)}
					renderBubble={(props) => (
						<CustomBubble
							{...props}
							convo={(route.params as any).id}
							reactions={reactions}
							context={context}
							setCurrent={setCurrent}
							setReplying={setReplying}
						/>
					)}
					renderInputToolbar={(props) => (
						<CustomToolbar
							{...props}
							convo={(route.params as any).id}
							attachments={attachments}
							setAttachments={setAttachments}
							replying={replying}
							setReplying={setReplying}
						/>
					)}
				/>
				<Modalize
					ref={reactions}
					withHandle={false}
					adjustToContentHeight={true}
					childrenStyle={{
						backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
					}}
					flatListProps={{
						data: current?.reaction,
						renderItem: ({ item }) => (
							<List.Item
								title={item.sender.name}
								left={(props) => (
									<Text
										{...props}
										style={{ textAlignVertical: "center" }}
									>
										{item.char}
									</Text>
								)}
							/>
						),
					}}
				></Modalize>
				<Modalize
					ref={context}
					withHandle={false}
					adjustToContentHeight={true}
					childrenStyle={{
						backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
					}}
				>
					<View>
						<View
							style={{
								flex: 1,
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-around",
								height: 64,
							}}
						>
							<IconButton
								icon="close"
								size={32}
								color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
								onPress={() => react("")}
							/>
							<Text
								style={{ fontSize: 32 }}
								onPress={() => react("👍")}
							>
								👍
							</Text>
							<Text
								style={{ fontSize: 32 }}
								onPress={() => react("❤️")}
							>
								❤️
							</Text>
							<Text
								style={{ fontSize: 32 }}
								onPress={() => react("😆")}
							>
								😆
							</Text>
							<Text
								style={{ fontSize: 32 }}
								onPress={() => react("😮")}
							>
								😮
							</Text>
							<Text
								style={{ fontSize: 32 }}
								onPress={() => react("😢")}
							>
								😢
							</Text>
							<Palette
								visible={customReaction}
								onDismiss={() => setCustomReaction(false)}
								onPress={(e) => react(e)}
								anchor={
									<IconButton
										icon="plus"
										size={32}
										color={
											dark ? PRIMARY_LIGHT : PRIMARY_DARK
										}
										onPress={() =>
											setCustomReaction(() => true)
										}
									/>
								}
							/>
						</View>
						<List.Item
							title="Copy Message"
							onPress={() => {
								Clipboard.setStringAsync(current?.text || "");
								context.current?.close();
							}}
							left={(props) => (
								<List.Icon {...props} icon="clipboard-text" />
							)}
						/>
						<List.Item
							title="Reply"
							onPress={() => {
								setReplying({
									id: current?._id as string,
									avatar: current?.user.avatar as string,
								});
								context.current?.close();
							}}
							left={(props) => (
								<List.Icon {...props} icon="reply" />
							)}
						/>
						{current?.user._id === emitter.self.id && (
							<List.Item
								title="Delete message"
								onPress={remove}
								left={(props) => (
									<List.Icon {...props} icon="close" />
								)}
							/>
						)}
					</View>
				</Modalize>
				<Participants
					ref={participants}
					id={(route.params as any).id}
					profile={profile}
					setUser={setCurrentUser}
				/>
				<Profile ref={profile} user={currentUser?._id as any} />
				<Dialog visible={rename} onDismiss={renameCancel}>
					<Dialog.Title>Rename Conversation</Dialog.Title>
					<Dialog.Content>
						<TextInput
							autoFocus
							label="Name"
							value={newName}
							onChangeText={setNewName}
							onSubmitEditing={renameConvo}
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={renameCancel}>Cancel</Button>
						<Button onPress={renameConvo}>Rename</Button>
					</Dialog.Actions>
				</Dialog>
			</View>
		</Provider>
	);
};
