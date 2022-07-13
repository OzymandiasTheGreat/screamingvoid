import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { EventEmitter2 } from "eventemitter2";
import { VoidIdentity } from "@screamingvoid/core";

const app = "me.screamingvoid.app";

export type SavedIdentity = {
	displayName: string;
	publicKey: string;
	secretKey: string;
};

export class VoidInterface extends EventEmitter2 {
	private rl: readline.Interface;
	private paths!: {
		avatars: string;
		cache: string;
		config: string;
		data: string;
	};
	private core?: VoidIdentity;

	constructor() {
		super({ wildcard: true });
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false,
		});
		this.rl.on("line", (line) => {
			try {
				const ev = JSON.parse(line);
				this.emit(ev.event, ...ev.payload);
			} catch (err) {
				process.exit(2);
			}
		});
		const that = this;
		this.on("paths", ({ cache, config, data }) => {
			this.paths = {
				avatars: path.join(cache, app, "avatars"),
				cache: path.join(cache, app),
				config: path.join(config, app),
				data: path.join(data, app),
			};
			fs.mkdir(this.paths.avatars, { recursive: true }).then(() =>
				this.send("avatars", this.paths.avatars)
			);
		});
		this.on(["is", "loaded"], () => this.send("loaded", !!this.core));
		this.on(["request", "self"], () =>
			this.send("self", {
				id: this.core?.id,
				name: this.core?.name,
				bio: this.core?.bio,
			})
		);
		this.on(
			["request", "create"],
			async (
				data: SavedIdentity & {
					name: string;
					bio: string;
					avatar: string;
				}
			) => {
				const keyPair = {
					publicKey: Buffer.from(data.publicKey, "hex"),
					secretKey: Buffer.from(data.secretKey, "hex"),
				};
				this.core = await VoidIdentity.create(
					this.paths.data,
					keyPair,
					data.name,
					data.bio,
					data.avatar
				);
				this.subscribe();
				await fs.writeFile(
					path.join(this.paths.avatars, data.publicKey),
					data.avatar,
					"base64url"
				);
				this.send("self", {
					id: this.core?.id,
					name: this.core?.name,
					bio: this.core?.bio,
				});
				this.send("loaded", true);
			}
		);
		this.on(["request", "open"], async (data: SavedIdentity) => {
			const keyPair = {
				publicKey: Buffer.from(data.publicKey, "hex"),
				secretKey: Buffer.from(data.secretKey, "hex"),
			};
			this.core = await VoidIdentity.open(this.paths.data, keyPair);
			this.subscribe();
			this.send("self", {
				id: this.core?.id,
				name: this.core?.name,
				bio: this.core?.bio,
			});
			this.send("loaded", true);
		});
		this.on(["request", "close"], async () => {
			await this.core?.close();
			delete this.core;
			this.send("loaded", false);
		});
		this.on(["ensure", "avatar"], (pk: string) => {
			fs.access(path.join(this.paths.avatars, pk)).catch(() =>
				this.core?.lookup(Buffer.from(pk, "hex"))
			);
		});
		this.on(["request", "update", "profile"], ({ avatar, name, bio }) => {
			this.core?.updateProfile({ avatar, name, bio }).then(() => {
				this.send("self", {
					id: this.core?.id,
					name: this.core?.name,
					bio: this.core?.bio,
				});
			});
		});
		this.on(["request", "close"], async () => {
			await this.core?.close();
			delete this.core;
			this.send("self", {});
			this.send("loaded", false);
		});
		this.on(["request", "conversation", "requests"], () => {
			this.core
				?.conversationRequests()
				.then((data) => this.send(["conversation", "requests"], data));
		});
		this.on(["request", "conversation", "muuted"], () => {
			this.core
				?.conversationsMuted()
				.then((data) => this.send(["conversation", "muted"], data));
		});
		this.on(["accept", "conversation"], (id) => {
			this.core
				?.acceptConversation(Buffer.from(id, "hex"))
				.then(() => (this.core as VoidIdentity).conversationRequests())
				.then((data) => this.send(["conversation", "requests"], data));
		});
		this.on(["request", "conversation", "list"], (archived) => {
			this.core?.conversationsList(archived).then((data) => {
				this.send(["conversation", "list"], data);
			});
		});
		this.on(["request", "conversation", "meta"], (id) => {
			const convo = this.core?.conversations.get(id);
			if (convo) {
				this.send(["conversation", "meta", id], {
					name: convo.name,
					peers: Object.keys(convo.peers),
				});
			}
		});
		this.on(["request", "conversation", "rename"], ({ id, name }) => {
			this.core?.renameConversation(Buffer.from(id, "hex"), name);
		});
		this.on(["request", "conversation", "archive"], ({ id, archived }) => {
			this.core?.archiveConversation(Buffer.from(id, "hex"), archived);
		});
		this.on(["request", "conversation", "mute"], ({ id, muted }) => {
			this.core?.muteConversation(Buffer.from(id, "hex"), muted);
		});
		this.on(
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
					?.latest(
						data.last ? Buffer.from(data.last, "hex") : undefined,
						data.limit
					)
					.then(async (messages) => {
						const ret: any[] = [];
						for (let msg of messages) {
							let sender;
							if (msg.sender.toString("hex") === that.core?.id) {
								sender = {
									id: that.core?.id,
									name: that.core?.name,
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
							const reaction: any[] = [];
							for (let react of msg.reaction) {
								let sender;
								if (
									react.sender.toString("hex") ===
									that.core?.id
								) {
									sender = {
										id: that.core?.id,
										name: that.core?.name,
									};
								} else {
									sender = await (that.core as VoidIdentity)
										.lookup(react.sender)
										.then((peer) => ({
											id: peer.publicKey,
											name: peer.name,
										}))
										.catch(() => ({
											id: react.sender.toString("hex"),
										}));
								}
								reaction.push({
									sender,
									char: react.char,
								});
							}
							ret.push({
								id: msg.id.toString("hex"),
								sender,
								timestamp: msg.timestamp,
								body: msg.body,
								reaction,
								attachments: msg.attachments,
								target: msg.target?.toString("hex"),
							});
						}
						return ret;
					})
					.then((messages) =>
						that.send(["conversation", id], messages)
					);
			}
		);
		this.on(["request", "send"], (data) => {
			const convo = this.core?.conversations.get(data.id);
			convo?.postMessage({
				body: data.body,
				attachments: data.attachments,
				target: data.target
					? Buffer.from(data.target, "hex")
					: undefined,
			});
		});
		this.on(["request", "react"], (data) => {
			const convo = this.core?.conversations.get(data.convo);
			convo?.reactToMessage(
				Buffer.from(data.message, "hex"),
				data.reaction
			);
		});
		this.on(["request", "attachment"], ({ attachment, message, convo }) => {
			const conversation = this.core?.conversations.get(convo);
			conversation
				?.extractAttachment(
					attachment,
					Buffer.from(message, "hex"),
					path.join(this.paths.cache, "attachments")
				)
				.then((filepath) =>
					this.send(
						["conversation", "attachment", message],
						"file://" + filepath
					)
				);
		});
		this.on(["request", "peer"], (id) => {
			if (id === this.core?.id) {
				return this.send(["peer", id], {
					id,
					name: this.core?.name,
					bio: this.core?.bio,
				});
			}
			this.core
				?.lookup(Buffer.from(id, "hex"))
				.then((peer) => {
					this.send(["peer", peer.publicKey], {
						id: peer.publicKey,
						name: peer.name,
						bio: peer.bio,
					});
				})
				.catch(
					() => new Promise((resolve) => setTimeout(resolve, 7500))
				)
				.then(() =>
					(this.core as VoidIdentity).lookup(Buffer.from(id, "hex"))
				)
				.then((peer) => {
					this.send(["peer", peer.publicKey], {
						id: peer.publicKey,
						name: peer.name,
						bio: peer.bio,
					});
				})
				.catch((err) =>
					this.send(["peer", "error"], { id, error: err.name })
				);
		});
		this.on(
			["request", "conversation", "remove"],
			({ conversation, message }) => {
				const convo = this.core?.conversations.get(conversation);
				convo?.deleteMessage(Buffer.from(message, "hex"));
			}
		);
		this.on(["request", "start", "conversation"], ({ peers, name }) => {
			const participants: Set<string> = new Set(peers);
			this.core?.startConversation(
				[...participants].map((p) => Buffer.from(p.trim(), "hex")),
				name
			);
		});
	}

	send(event: string | string[], ...payload: any[]): void {
		if (typeof event !== "string") {
			event = event.join(".");
		}
		console.log(JSON.stringify({ event, payload }));
	}

	subscribe() {
		this.core?.on(["peer", "avatar"], (data) => {
			fs.writeFile(
				path.join(this.paths.avatars, data.publicKey.toString("hex")),
				data.avatar.slice(data.avatar.indexOf(",")),
				"base64"
			);
		});
		this.core?.on(["peer", "connect"], (pk) =>
			this.send(["peer", "connect"], pk.toString("hex"))
		);
		this.core?.on(["peer", "disconnect"], (pk) =>
			this.send(["peer", "disconnect"], pk.toString("hex"))
		);
		this.core?.on(["peer", "error"], ({ publicKey, error }) =>
			this.send(["peer", "error"], {
				id: publicKey.toString("hex"),
				error: error.name,
			})
		);
		this.core?.on(["conversation", "new"], (id) =>
			this.send(["conversation", "new"], id)
		);
		this.core?.on(["conversation", "rename"], ({ id, name }) =>
			this.send(["conversation", "rename", id.toString("hex")], name)
		);
		this.core?.on(["conversation", "request"], ({ id, name, peers }) =>
			this.send(["conversation", "request"], {
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
				if (message.sender.toString("hex") === this.core?.id) {
					sender = {
						id: this.core?.id as string,
						name: this.core?.name,
					};
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
				const reaction: any[] = [];
				for (let react of message.reaction) {
					let sender;
					if (react.sender.toString("hex") === this.core?.id) {
						sender = {
							id: this.core?.id,
							name: this.core?.name,
						};
					} else {
						sender = await (this.core as VoidIdentity)
							.lookup(react.sender)
							.then((peer) => ({
								id: peer.publicKey,
								name: peer.name,
							}))
							.catch(() => ({
								id: react.sender.toString("hex"),
							}));
					}
					reaction.push({ sender, char: react.char });
				}
				this.send(
					["conversation", "message", conversation.toString("hex")],
					{
						conversation: conversation.toString("hex"),
						message: {
							id: message.id.toString("hex"),
							sender,
							timestamp: message.timestamp,
							body: message.body,
							reaction,
							attachments: message.attachments,
							target: message.target?.toString("hex"),
						},
						replyTo: replyTo?.toString("hex"),
					}
				);
			}
		);
		this.core?.on(
			["conversation", "remove"],
			({ conversation, message }) => {
				this.send(
					["conversation", "remove", conversation.toString("hex")],
					message.toString("hex")
				);
			}
		);
		this.core?.on(
			["conversation", "react"],
			async ({ conversation, target, replyTo, sender: op, reaction }) => {
				let sender;
				if (op.toString("hex") === this.core?.id) {
					sender = { id: this.core.id, name: this.core.name };
				} else {
					sender = await (this.core as VoidIdentity)
						.lookup(op)
						.then((peer) => ({
							id: peer.publicKey,
							name: peer.name,
						}))
						.catch(() => ({ id: op.toString("hex") }));
				}
				this.send(
					["conversation", "react", conversation.toString("hex")],
					{
						target: target.toString("hex"),
						replyTo: replyTo.toString("hex"),
						sender,
						reaction,
					}
				);
			}
		);
		this.core?.on(["conversation", "archive"], ({ id, archived }) => {
			this.send(
				["conversation", "archive", id.toString("hex")],
				archived
			);
		});
	}
}

export const iface = new VoidInterface();
