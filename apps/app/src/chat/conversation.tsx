import { NavigationProp, RouteProp } from "@react-navigation/native";
import type levelup from "levelup";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import type { IMessage, BubbleProps } from "react-native-gifted-chat";
import sublevel from "subleveldown";
import { PrefsContext, VoidContext } from "../context";

const CustomBubble = (props: BubbleProps<IMessage>) => {
	const [pressed, setPressed] = useState(false);

	return (
		<Bubble
			{...props}
			onPress={() => setPressed(!pressed)}
			renderTime={pressed ? props.renderTime : () => <></>}
			textStyle={{ left: { padding: 3 }, right: { padding: 3 } }}
			onLongPress={(ctx: any, msg: any) =>
				console.log(ctx.actionSheet(), msg)
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
	const [log, setLog] = useState<levelup.LevelUp>();
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [initial, setInitial] = useState(true);

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
						msgs.map((msg) => ({
							_id: msg.id,
							createdAt: msg.timestamp,
							user: {
								_id: msg.sender.id,
								name: msg.sender.name,
								avatar: emitter.getAvatar(msg.sender.id),
							},
							text: msg.body,
						}))
					);
					log?.put((route.params as any).id, msgs[0].id);
					setInitial(false);
				} else {
					setMessages((prev) =>
						GiftedChat.prepend(
							prev,
							msgs.map((msg) => ({
								_id: msg.id,
								createdAt: msg.timestamp,
								user: {
									_id: msg.sender.id,
									name: msg.sender.name,
									avatar: emitter.getAvatar(msg.sender.id),
								},
								text: msg.body,
							}))
						)
					);
				}
			}
		);
		const listener2 = emitter.on(
			["conversation", "message", (route.params as any).id],
			(msg) => {
				setMessages((prev) =>
					GiftedChat.append(prev, [
						{
							_id: msg.message.id,
							user: {
								_id: msg.message.sender.id,
								name: msg.message.sender.name,
								avatar: emitter.getAvatar(
									msg.message.sender.id
								),
							},
							createdAt: msg.message.timestamp,
							text: msg.message.body,
						},
					])
				);
				log?.put((route.params as any).id, msg.message.id);
			}
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
		};
	}, [log, initial]);

	return (
		<GiftedChat
			user={{ _id: emitter.self.id, name: emitter.self.name }}
			messages={messages}
			onSend={(msgs) =>
				msgs.map((msg) =>
					emitter.emit(["request", "send"], {
						id: (route.params as any).id,
						body: msg.text,
					})
				)
			}
			renderBubble={(props) => <CustomBubble {...props} />}
		/>
	);
};
