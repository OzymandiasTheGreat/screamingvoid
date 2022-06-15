import { Buffer } from "buffer";
import { EventEmitter2, Listener } from "eventemitter2";
import * as Linking from "expo-linking";
import path from "path";
import RNFS from "react-native-fs";
import notifee from "@notifee/react-native";
import { VoidIdentity } from "@screamingvoid/core";
import type { ChatReaction } from "@screamingvoid/core/src/proto/conversation";

const AVATARS = path.join(RNFS.CachesDirectoryPath, "avatars");
RNFS.mkdir(AVATARS);

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
};

export type MessageList = {
	id: string;
	name: string;
	peers: { id: string; name?: string }[];
	last?: {
		id: string;
		sender: { id: string; name?: string };
		timestamp: number;
		body: string;
	};
}[];

export type ChatMessage = {
	id: string;
	sender: { id: string; name?: string };
	timestamp: number;
	body: string;
	reaction: { sender: { id: string; name: string }; value: string }[];
};

export class VoidInterface extends EventEmitter2 {
	core?: VoidIdentity;

	constructor() {
		super({ wildcard: true });
		this.on(["conversation", "request"], ({ id, name, peers }) => {
			notifee.displayNotification({
				id: "chat-request",
				data: { id },
				title: "New Chat Request",
				body: `${peers
					.map((p) => p.name || "")
					.join(", ")} want you to join a conversation ${name}`,
				android: {
					channelId: "chat",
					actions: [
						{
							title: "Accept",
							pressAction: { id: "accept-convo" },
						},
						{
							title: "Reject",
							pressAction: { id: "dismiss-convo" },
						},
					],
				},
			});
		});
		notifee.onBackgroundEvent(async ({ detail, type }) => {
			switch (type) {
				case 1:
					Linking.openURL(Linking.createURL("/chat-requests"));
					break;
				case 2:
					switch (detail.pressAction?.id) {
						case "accept-convo":
							this.core?.emit(
								["accept", "conversation"],
								detail.notification?.data?.id as string
							);
							break;
					}
					break;
			}
		});
	}

	private onInternal(event: ["is", "loaded"], listener: () => void): Listener;
	private onInternal(
		event: ["request", "create"],
		listener: (
			data: SavedIdentity & { name: string; bio: string; avatar: string }
		) => void
	): Listener;
	private onInternal(
		event: ["request", "open"],
		listener: (data: SavedIdentity) => void
	): Listener;
	private onInternal(
		event: ["request", "conversation", "requests"],
		listener: () => void
	): Listener;
	private onInternal(
		event: ["accept", "conversation"],
		listener: (id: string) => void
	): Listener;
	private onInternal(
		event: ["request", "conversation", "list"],
		listener: () => void
	): Listener;
	private onInternal(
		event: ["request", "conversation", string],
		listener: (data: { last?: number; limit?: number }) => void
	): Listener;
	private onInternal(
		event: ["request", "send"],
		listener: (data: {
			id: string;
			body: string;
			attachments?: string[];
			target?: string;
		}) => void
	): Listener;
	private onInternal(
		event: any,
		listener: (...args: any[]) => void
	): Listener {
		return super.on(event, listener, { objectify: true }) as any;
	}

	on(event: "loaded", listener: (loaded: boolean) => void): Listener;
	on(event: ["peer", "connect"], listener: (id: string) => void): Listener;
	on(event: ["peer", "disconnect"], listener: (id: string) => void): Listener;
	on(
		event: ["peer", "avatar"],
		listener: (data: { id: string; avatar: string }) => void
	): Listener;
	on(
		event: ["peer", "error"],
		listener: (data: { id: string; error: string }) => void
	): Listener;
	on(
		event: ["conversation", "rename"],
		listener: (data: { id: string; name: string }) => void
	): Listener;
	on(
		event: ["conversation", "request"],
		listener: (data: {
			id: string;
			name: string;
			peers: { id: string; name?: string; bio?: string }[];
		}) => void
	): Listener;
	on(
		event: ["conversation", "message", string],
		listener: (data: {
			conversation: string;
			message: {
				id: string;
				sender: { id: string; name?: string };
				timestamp: number;
				body: string;
				reaction: { type: number; sender: string }[];
				target?: string;
				attachments: string[];
			};
			replyTo?: string;
		}) => void
	): Listener;
	on(
		event: ["conversation", "remove"],
		listener: (data: { conversation: string; message: string }) => void
	): Listener;
	on(
		event: ["conversation", "react"],
		listener: (data: {
			conversation: string;
			target: string;
			replyTo: string;
		}) => void
	): Listener;
	on(
		event: ["conversation", "requests"],
		listener: (
			data: {
				id: string;
				name: string;
				peers: { id: string; name?: string; bio?: string }[];
			}[]
		) => void
	): Listener;
	on(
		event: ["conversation", "list"],
		listener: (data: MessageList) => void
	): Listener;
	on(
		event: ["conversation", string],
		listener: (data: ChatMessage[]) => void
	): Listener;
	on(event: any, listener: (...args: any[]) => void): Listener {
		return super.on(event, listener, { objectify: true }) as any;
	}

	private emitInternal(event: "loaded", loaded: boolean): boolean;
	private emitInternal(event: ["peer", "connect"], id: string): boolean;
	private emitInternal(event: ["peer", "disconnect"], id: string): boolean;
	private emitInternal(
		event: ["peer", "error"],
		data: { id: string; error: string }
	): boolean;
	private emitInternal(
		event: ["conversation", "rename"],
		data: { id: string; name: string }
	): boolean;
	private emitInternal(
		event: ["conversation", "request"],
		data: {
			id: string;
			name: string;
			peers: { id: string; name?: string; bio?: string }[];
		}
	): boolean;
	private emitInternal(
		event: ["conversation", "message", string],
		data: {
			conversation: string;
			message: {
				id: string;
				sender: { id: string; name?: string };
				timestamp: number;
				body: string;
				reaction: { type: number; sender: string }[];
				target?: string;
				attachments: string[];
			};
			replyTo?: string;
		}
	): boolean;
	private emitInternal(
		event: ["conversation", "remove"],
		data: { conversation: string; message: string }
	): boolean;
	private emitInternal(
		event: ["conversation", "react"],
		data: { conversation: string; target: string; replyTo: string }
	): boolean;
	private emitInternal(
		event: ["conversation", "requests"],
		data: {
			id: string;
			name: string;
			peers: { id: string; name?: string; bio?: string }[];
		}[]
	): boolean;
	private emitInternal(
		event: ["conversation", "list"],
		data: MessageList
	): boolean;
	private emitInternal(
		event: ["conversation", string],
		data: ChatMessage[]
	): boolean;
	private emitInternal(event: string | string[], ...values: any[]): boolean {
		return super.emit(event, ...values);
	}

	emit(event: ["is", "loaded"]): boolean;
	emit(
		event: ["request", "create"],
		data: SavedIdentity & { name: string; bio: string; avatar: string }
	): boolean;
	emit(event: ["request", "open"], data: SavedIdentity): boolean;
	emit(event: ["request", "conversation", "requests"]): boolean;
	emit(event: ["accept", "conversation"], id: string): boolean;
	emit(event: ["request", "conversation", "list"]): boolean;
	emit(
		event: ["request", "conversation", string],
		data: { last?: number; limit?: number }
	): boolean;
	emit(
		event: ["request", "send"],
		data: {
			id: string;
			body: string;
			attachments?: string[];
			target?: string;
		}
	): boolean;
	emit(event: string | string[], ...values: any[]): boolean {
		return super.emit(event, ...values);
	}

	private subscribe() {
		this.core?.on(["peer", "avatar"], (data) => {
			RNFS.writeFile(
				path.join(AVATARS, data.publicKey.toString("hex")),
				data.avatar.slice(data.avatar.indexOf(",")),
				"base64"
			);
		});
		this.core?.on(["peer", "connect"], (pk) =>
			this.emitInternal(["peer", "connect"], pk.toString("hex"))
		);
		this.core?.on(["peer", "disconnect"], (pk) =>
			this.emitInternal(["peer", "disconnect"], pk.toString("hex"))
		);
		this.core?.on(["peer", "error"], ({ publicKey, error }) =>
			this.emitInternal(["peer", "error"], {
				id: publicKey.toString("hex"),
				error: error.name,
			})
		);
		this.core?.on(["conversation", "rename"], ({ id, name }) =>
			this.emitInternal(["conversation", "rename"], {
				id: id.toString("hex"),
				name,
			})
		);
		this.core?.on(["conversation", "request"], ({ id, name, peers }) =>
			this.emitInternal(["conversation", "request"], {
				id: id.toString("hex"),
				name,
				peers: peers.map((p) => ({
					id: p.publicKey,
					name: p.name,
					bio: p.bio,
				})),
			})
		);
		this.core?.on(
			["conversation", "message"],
			async ({ conversation, message, replyTo }) => {
				let sender: { id: string; name?: string };
				if (message.sender.toString("hex") === this.self.id) {
					sender = { id: this.self.id, name: this.self.name };
				} else {
					sender = (await this.core
						?.lookup(message.sender)
						.then((peer) => ({
							id: peer.publicKey,
							name: peer.name,
						}))
						.catch(() => ({
							id: message.sender.toString("hex"),
						}))) as any;
				}
				this.emitInternal(
					["conversation", "message", conversation.toString("hex")],
					{
						conversation: conversation.toString("hex"),
						message: {
							id: message.id.toString("hex"),
							sender: sender,
							timestamp: message.timestamp,
							target: message.target,
							body: message.body,
							reaction: message.reaction.map(
								(r: ChatReaction) => ({
									type: r.type,
									sender: r.sender.toString("hex"),
								})
							),
							attachments: message.attachments,
						},
						replyTo: replyTo?.toString("hex"),
					}
				);
			}
		);
		this.core?.on(["conversation", "remove"], ({ conversation, message }) =>
			this.emitInternal(["conversation", "remove"], {
				conversation: conversation.toString("hex"),
				message: message.toString("hex"),
			})
		);
		this.core?.on(
			["conversation", "react"],
			({ conversation, target, replyTo }) =>
				this.emitInternal(["conversation", "react"], {
					conversation: conversation.toString("hex"),
					target: target.toString("hex"),
					replyTo: replyTo.toString("hex"),
				})
		);
	}

	listen() {
		const that = this;
		this.onInternal(["is", "loaded"], () => {
			this.emitInternal("loaded", !!this.core);
		});
		this.onInternal(["request", "create"], async (data) => {
			// TODO DELETEME
			console.log(data.publicKey);
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			this.core = await VoidIdentity.create(
				RNFS.DocumentDirectoryPath,
				keyPair,
				data.name,
				data.bio,
				data.avatar
			);
			// TODO DELETEME
			this.core.onAny(console.log);
			this.subscribe();
			await RNFS.writeFile(
				path.join(AVATARS, data.publicKey),
				data.avatar,
				"base64"
			);
			this.emitInternal("loaded", true);
		});
		this.onInternal(["request", "open"], async (data) => {
			// TODO DELETEME
			console.log(data.publicKey);
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			this.core = await VoidIdentity.open(
				RNFS.DocumentDirectoryPath,
				keyPair
			);
			// TODO DELETEME
			this.core.onAny(console.log);
			this.subscribe();
			this.emitInternal("loaded", true);
		});
		this.onInternal(["request", "conversation", "requests"], () => {
			this.core
				?.conversationRequests()
				.then((data) =>
					this.emitInternal(["conversation", "requests"], data)
				);
		});
		this.onInternal(["accept", "conversation"], (id) => {
			this.core
				?.acceptConversation(Buffer.from(id, "hex"))
				.then(() => (this.core as VoidIdentity).conversationRequests())
				.then((data) =>
					this.emitInternal(["conversation", "requests"], data)
				);
		});
		this.onInternal(["request", "conversation", "list"], () => {
			this.core
				?.conversationsList()
				.then((data) =>
					this.emitInternal(["conversation", "list"], data)
				);
		});
		this.onInternal(
			["request", "conversation", "*"],
			function (this: { event: string }, data) {
				const id = this.event.split(".")[2];
				if (id?.length !== 48) {
					return;
				}
				try {
					Buffer.from(id, "hex");
				} catch {
					return;
				}
				const convo = that.core?.conversations.get(id);
				convo
					?.latest(data.last, data.limit)
					.then(async (messages) => {
						const ret: ChatMessage[] = [];
						for (let msg of messages) {
							let sender;
							if (msg.sender.toString("hex") === that.self.id) {
								sender = {
									id: that.self.id,
									name: that.self.id,
								};
							} else {
								sender = await (that.core as VoidIdentity)
									.lookup(msg.sender)
									.then((peer) => ({
										id: peer.publicKey,
										name: peer.name,
									}))
									.catch(() => ({
										id: msg.sender.toString("hex"),
									}));
							}
							ret.push({
								id: msg.id.toString("hex"),
								sender,
								timestamp: msg.timestamp,
								body: msg.body,
								reaction: [],
							});
						}
						return ret;
					})
					.then((messages) =>
						that.emitInternal(["conversation", id], messages)
					);
			}
		);
		this.onInternal(["request", "send"], (data) => {
			const convo = this.core?.conversations.get(data.id);
			convo?.postMessage({
				body: data.body,
				attachments: data.attachments,
				target: data.target
					? Buffer.from(data.target, "hex")
					: undefined,
			});
		});
	}

	getAvatar(id: string): string {
		const avatar = path.join(AVATARS, id);
		RNFS.exists(avatar).then((exists) => {
			if (!exists) {
				return this.core?.lookup(Buffer.from(id, "hex"));
			}
		});
		return "file://" + avatar;
	}

	get self() {
		return {
			id: this.core?.id as string,
			name: this.core?.name,
			bio: this.core?.bio,
		};
	}
}
