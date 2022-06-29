import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import {
	NavigationProp,
	RouteProp,
	DefaultTheme,
} from "@react-navigation/native";
import emojiRegex from "emoji-regex";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import type levelup from "levelup";
import notifee from "@notifee/react-native";
import path from "path";
import React, { useContext, useEffect, useRef, useState } from "react";
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
} from "react-native-gifted-chat";
import type { IMessage, BubbleProps } from "react-native-gifted-chat";
import { Modalize } from "react-native-modalize";
import { Headline, IconButton, List, Text } from "react-native-paper";
import { Keyboard } from "react-native-ui-lib";
import sublevel from "subleveldown";
import { PrefsContext, VoidContext } from "../context";
import { FlatList } from "react-native";
import { useColorScheme } from "react-native";
import { SwipeRow } from "react-native-swipe-list-view";
import { EmojiPalette } from "../shared/emoji";
import { imageURIs } from "../util";
import { ChatMessage } from "../interface";
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

interface Message extends IMessage {
	reaction: { sender: { id: string; name: string }; char: string }[];
	attachments: string[];
	replyingTo?: Message;
}

interface ReplyingTo {
	id: string;
	avatar: string;
}

const UserSheet: React.FC<{
	visible: boolean;
	user?: Message["user"];
	onClose: (val: boolean) => void;
}> = ({ visible, user, onClose }) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const ref = useRef<Modalize>(null);
	const [avatar, setAvatar] = useState("");
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");

	useEffect(() => {
		if (visible) {
			ref.current?.open();
		} else {
			ref.current?.close();
		}
	}, [visible]);
	useEffect(() => {
		if (user) {
			setAvatar(user.avatar as string);
			setName(user.name as string);
		}
	}, [user]);
	useEffect(() => {
		if (user) {
			const listener = emitter.once(
				["peer", user._id as string],
				(peer) => {
					setName(peer.name);
					setBio(peer.bio);
				},
				{ objectify: true }
			);
			emitter.emit(["request", "peer"], user._id as string);
			return () => {
				(listener as any).off();
			};
		}
	}, [user]);

	return (
		<Modalize
			ref={ref}
			onClose={() => onClose(false)}
			childrenStyle={{
				backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
			}}
			withHandle={false}
			modalHeight={384}
			HeaderComponent={
				<View
					style={{
						alignItems: "center",
						justifyContent: "space-around",
						width: "100%",
						minHeight: 256,
						backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
					}}
				>
					<Image
						source={{
							uri: avatar as string,
							width: 128,
							height: 128,
						}}
						borderRadius={64}
					/>
					<Headline>{name}</Headline>
					<Text>{bio}</Text>
				</View>
			}
		></Modalize>
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
				Sharing.shareAsync(uri);
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
			<View>
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
							paddingTop: 3,
							fontSize: isEmoji(props.currentMessage?.text)
								? 48
								: 16,
							lineHeight: isEmoji(props.currentMessage?.text)
								? 56
								: 18,
						},
						right: {
							paddingTop: 3,
							fontSize: isEmoji(props.currentMessage?.text)
								? 48
								: 16,
							lineHeight: isEmoji(props.currentMessage?.text)
								? 56
								: 18,
						},
					}}
					onPress={() => setPressed(!pressed)}
					onLongPress={() => {
						props.setCurrent(props.currentMessage);
						props.context.current?.open();
					}}
					renderTime={pressed ? props.renderTime : () => <></>}
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
		customText: string;
		setCustomText: (t: string) => void;
		setSelection: (s: { start: number; end: number }) => void;
		replying?: ReplyingTo;
		setReplying: (r?: ReplyingTo) => void;
		setKeyboard: (
			k?: string | ((prev?: string) => string | undefined)
		) => void;
	}
) => {
	const dark = useColorScheme() === "dark";
	const { width, height } = useWindowDimensions();
	const emitter = useContext(VoidContext);

	const send = () => {
		emitter.emit(["request", "send"], {
			id: props.convo,
			body: props.customText,
			attachments: props.attachments,
			target: props.replying?.id,
		});
		props.setCustomText("");
		props.setAttachments([]);
		props.setReplying();
	};

	const renderComposer = (cprops: ComposerProps) => (
		<View
			style={{
				flexDirection: "row",
				width: props.customText
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
						borderRadius={12}
					/>
				</TouchableOpacity>
			)}
			<Composer
				{...cprops}
				text={props.customText}
				onTextChanged={(text) => {
					cprops.onTextChanged?.(text);
					props.setCustomText(text);
				}}
				textInputProps={{
					onSelectionChange: (e) =>
						props.setSelection(e.nativeEvent.selection),
				}}
			/>
			<IconButton
				icon="emoticon"
				size={24}
				color={PRIMARY_BLUE}
				onPress={() =>
					props.setKeyboard((k) => (k ? undefined : EmojiPalette))
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

export const Conversation: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const prefs = useContext(PrefsContext);
	const dark = useColorScheme() === "dark";
	const [log, setLog] = useState<levelup.LevelUp>();
	const [initial, setInitial] = useState(true);

	const [messages, setMessages] = useState<Message[]>([]);
	const [current, setCurrent] = useState<Message | null | undefined>(null);
	const [loading, setLoading] = useState(false);

	const reactions = useRef<Modalize>(null);
	const context = useRef<Modalize>(null);
	const actions = useRef<Modalize>(null);
	const [profile, setProfile] = useState(false);
	const [currentUser, setCurrentUser] = useState<Message["user"]>();

	const [keyboard, setKeyboard] = useState<string | undefined>();
	const [text, setText] = useState("");
	const [selection, setSelection] = useState({ start: 0, end: 0 });
	const [attachments, setAttachments] = useState<string[]>([]);
	const [customReaction, setCustomReaction] = useState<string | undefined>();
	const [replying, setReplying] = useState<ReplyingTo>();

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
							m.image = a;
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

	useEffect(
		() =>
			setLog(
				sublevel(prefs, "VOID_MESSAGE_LOG", {
					keyEncoding: "utf8",
					valueEncoding: "utf8",
				})
			),
		[]
	);
	useEffect(() => {
		const listener1 = emitter.on(
			["conversation", (route.params as any).id as string],
			(msgs) => {
				if (initial) {
					setMessages(
						msgs.map(messageMapper).filter((m) => !!m) as Message[]
					);
					log?.put((route.params as any).id, msgs[0].id);
					setInitial(false);
				} else {
					setMessages((prev) =>
						GiftedChat.prepend(
							prev,
							msgs
								.map(messageMapper)
								.filter((m) => !!m) as Message[]
						)
					);
				}
				setLoading(false);
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
				log?.put((route.params as any).id, msg.message.id);
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
		if (log && initial) {
			emitter.emit(
				["request", "conversation", (route.params as any).id as string],
				{}
			);
		}
		return () => {
			listener1?.off();
			listener2.off();
			listener3.off();
			listener4.off();
		};
	}, [log, initial]);
	useEffect(() => {
		notifee
			.getDisplayedNotifications()
			.then((notifications) =>
				notifee.cancelDisplayedNotifications(
					notifications
						.map((n) => n.id || "")
						.filter((n) => n.startsWith((route.params as any).id))
				)
			);
	}, []);

	const react = (reaction: string) => {
		emitter.emit(["request", "react"], {
			convo: (route.params as any).id,
			message: current?._id as string,
			reaction,
		});
		context.current?.close();
		setCustomReaction(undefined);
	};

	const remove = () => {
		emitter.emit(["request", "conversation", "remove"], {
			conversation: (route.params as any).id,
			message: current?._id,
		});
		context.current?.close();
	};

	const insertEmoji = (e: string) =>
		setText(
			(text) =>
				text.slice(0, selection.start) +
				`${e} ` +
				text.slice(selection.end)
		);

	const loadEarlier = () => {
		setLoading(true);
		emitter.emit(
			["request", "conversation", (route.params as any).id as string],
			{ last: messages[messages.length - 1]._id }
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<GiftedChat
				user={{ _id: emitter.self.id, name: emitter.self.name }}
				messages={messages}
				imageStyle={{ margin: 7 }}
				messagesContainerStyle={{
					paddingBottom: 7 + attachments.length * 48,
				}}
				onPressActionButton={() => actions.current?.open()}
				onPressAvatar={(user) => {
					setProfile(true);
					setCurrentUser(user);
				}}
				loadEarlier
				onLoadEarlier={loadEarlier}
				isLoadingEarlier={loading}
				infiniteScroll
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
						customText={text}
						setCustomText={setText}
						setSelection={setSelection}
						replying={replying}
						setReplying={setReplying}
						setKeyboard={setKeyboard}
					/>
				)}
			/>
			<Keyboard.KeyboardAccessoryView
				kbComponent={keyboard}
				onItemSelected={(_, e) => insertEmoji(e)}
				onKeyboardResigned={() => setKeyboard(undefined)}
			/>
			<Modalize
				ref={actions}
				withHandle={false}
				adjustToContentHeight
				childrenStyle={{
					backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-around",
					}}
				>
					<IconButton
						icon="camera"
						size={32}
						color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
						onPress={() => {
							ImagePicker.launchCameraAsync({
								quality: 0.9,
							}).then((image) => {
								if (!image.cancelled) {
									setAttachments((a) => [image.uri, ...a]);
								}
							});
							actions.current?.close();
						}}
					/>
					<IconButton
						icon="image"
						size={32}
						color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
						onPress={() => {
							ImagePicker.launchImageLibraryAsync().then(
								(image) => {
									if (!image.cancelled) {
										setAttachments((a) => [
											image.uri,
											...a,
										]);
									}
								}
							);
							actions.current?.close();
						}}
					/>
					<IconButton
						icon="paperclip"
						size={32}
						color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
						onPress={() => {
							DocumentPicker.getDocumentAsync().then((doc) => {
								if (doc.type === "success") {
									setAttachments((a) => [doc.uri, ...a]);
								}
							});
							actions.current?.close();
						}}
					/>
				</View>
			</Modalize>
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
						<IconButton
							icon="plus"
							size={32}
							color={dark ? PRIMARY_LIGHT : PRIMARY_DARK}
							onPress={() =>
								setCustomReaction(() =>
									customReaction ? undefined : EmojiPalette
								)
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
						left={(props) => <List.Icon {...props} icon="reply" />}
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
					<Keyboard.KeyboardAccessoryView
						kbComponent={customReaction}
						onItemSelected={(_, e) => react(e)}
						onKeyboardResigned={() => setCustomReaction(undefined)}
					/>
				</View>
			</Modalize>
			<UserSheet
				visible={profile}
				user={currentUser}
				onClose={setProfile}
			/>
		</View>
	);
};
