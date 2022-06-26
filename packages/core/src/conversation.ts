import Autobase from "autobase";
import { Buffer } from "buffer";
import { EventEmitter2 } from "eventemitter2";
import * as fs from "fs";
import * as fsp from "fs/promises";
import HyperBee from "hyperbee";
import Hypercore from "hypercore";
import path from "path";
import sodium from "sodium-universal";
import { Readable } from "stream";
import type { VoidIdentity } from ".";
import { MessageNotFound } from "./errors";
import {
	ChatHash,
	ChatInput,
	ChatInputType,
	ChatMessage,
	ConversationInput,
	ConversationMeta,
	ConversationPeer,
} from "./proto/conversation";
import { hash, sign } from "./util";

export class VoidConversation extends EventEmitter2 {
	id: Buffer;
	name: string;
	archived: boolean;
	peers!: Record<string, ConversationPeer>;

	private host: VoidIdentity;
	private base!: Autobase;
	private live!: Readable;
	private localInput: Hypercore;
	private localOutput: Hypercore;
	private localStorage: HyperBee;

	feed!: HyperBee;
	storage: Map<string, HyperBee> = new Map();

	constructor(
		id: Buffer,
		meta: ConversationMeta,
		peer: ConversationPeer,
		host: VoidIdentity,
	) {
		super({ wildcard: true });
		const hex = id.toString("hex");
		this.id = id;
		this.name = meta.name;
		this.archived = meta.archived;
		this.localInput = host.corestore.get(peer.input);
		this.localOutput = host.corestore.get({
			name: `${hex}-OUTPUT`,
		});
		this.localStorage = new HyperBee(host.corestore.get(peer.storage), {
			keyEncoding: "binary",
			valueEncoding: "binary",
		});
		this.host = host;
	}

	private async loadInputs() {
		for (let [peerHex, peer] of Object.entries(this.peers)) {
			if (peer) {
				const i = this.host.corestore.get(peer.input);
				if (!this.base.inputs.some((i) => i.key.equals(peer.input))) {
					await this.base.addInput(i);
				}
			}
		}
	}

	static async open(
		id: Buffer,
		meta: ConversationMeta,
		peer: ConversationPeer,
		host: VoidIdentity,
	): Promise<VoidConversation> {
		const convo = new VoidConversation(id, meta, peer, host);
		const input: ConversationInput = await host.convoStore.get(id);
		convo.peers = input.peers;
		convo.base = new Autobase({
			unwrap: true,
			localInput: convo.localInput,
			localOutput: convo.localOutput,
			async apply(batch: { id: string; value: Buffer }[]) {
				const b = convo.feed.batch({ update: false });
				for (let { id, value } of batch) {
					const peer = Object.entries(convo.peers).find(
						([hex, { input }]) =>
							input.equals(Buffer.from(id, "hex")),
					);
					const sender = peer ? Buffer.from(peer[0], "hex") : null;
					if (sender) {
						const sig = value.slice(0, sodium.crypto_sign_BYTES);
						const msg = value.slice(sodium.crypto_sign_BYTES);
						if (
							sodium.crypto_sign_verify_detached(
								sig,
								msg,
								sender,
							)
						) {
							const op = ChatInput.decode(msg);
							if (!sender.equals(op.sender)) {
								continue;
							}
							const timestamp = Buffer.allocUnsafe(8);
							timestamp.writeBigUInt64BE(BigInt(op.timestamp));
							const key = Buffer.concat([timestamp, sig]);
							const message: ChatMessage = {} as any;
							let target: ChatMessage | null;
							switch (op.type) {
								case ChatInputType.POST:
								case ChatInputType.REPLY:
									message["id"] = key;
									message["sender"] = op.sender;
									message["timestamp"] = op.timestamp;
									message["hashes"] = op.hashes;
									message["body"] = op.body || "";
									message["reaction"] = [];
									message["target"] =
										op.type === ChatInputType.REPLY
											? op.target
											: (null as any);
									message["attachments"] = op.attachments;
									await b.put(key, message);
									break;
								case ChatInputType.DELETE:
									target = await convo.feed
										.get(op.target as Buffer, {
											update: false,
										})
										.then(({ value }) => value as any)
										.catch(() => null);
									if (target?.sender.equals(op.sender)) {
										await b.del(op.target as Buffer);
									}
									break;
								case ChatInputType.REACT:
									target = await convo.feed
										.get(op.target as Buffer, {
											update: false,
										})
										.then(({ value }) => value as any)
										.catch(() => null);
									if (target) {
										const reaction = target.reaction.find(
											(r) => r.sender.equals(op.sender),
										);
										if (op.reaction) {
											if (reaction) {
												reaction.char = op.reaction;
											} else {
												target.reaction.push({
													char: op.reaction,
													sender: op.sender,
												});
											}
										} else {
											if (reaction) {
												target.reaction.splice(
													target.reaction.indexOf(
														reaction,
													),
													1,
												);
											}
										}
										await b.put(
											op.target as Buffer,
											target,
										);
									}
									break;
							}
							await b.flush();
						}
					}
				}
			},
		});
		await convo.loadInputs();
		host.convoStore.on("put", async (id: Buffer, c: ConversationInput) => {
			if (convo.id.equals(id)) {
				convo.peers = c.peers;
				await convo.loadInputs();
			}
		});
		convo.feed = new HyperBee(convo.base.view as any, {
			extension: false,
			keyEncoding: "binary",
			valueEncoding: ChatMessage as any,
		});
		convo.live = convo.base.createReadStream({ live: true, tail: true });
		convo.live.on(
			"data",
			async ({ key, value }: { key: Buffer; value: Buffer }) => {
				const peer = Object.entries(convo.peers).find(
					([hex, { input }]) => input.equals(key),
				);
				const sender = peer ? Buffer.from(peer[0], "hex") : null;
				if (sender) {
					const sig = value.slice(0, sodium.crypto_sign_BYTES);
					const msg = value.slice(sodium.crypto_sign_BYTES);
					if (sodium.crypto_sign_verify_detached(sig, msg, sender)) {
						const op = ChatInput.decode(msg);
						const timestamp = Buffer.allocUnsafe(8);
						timestamp.writeBigUInt64BE(BigInt(op.timestamp));
						const id = Buffer.concat([timestamp, sig]);
						let replyTo = null;
						switch (op.type) {
							case ChatInputType.POST:
							case ChatInputType.REPLY:
								const message: ChatMessage = (
									await convo.feed.get(id)
								).value as any;
								if (op.type === ChatInputType.REPLY) {
									replyTo = (
										(
											await convo.feed.get(
												op.target as Buffer,
											)
										).value as ChatMessage
									).sender;
								}
								convo.emit(["conversation", "message"], {
									conversation: convo.id,
									message,
									replyTo,
								});
								return;
							case ChatInputType.DELETE:
								// const target: ChatMessage = (
								// 	await convo.feed.get(op.target as Buffer)
								// ).value as any;
								// if (sender.equals(target.sender)) {
								convo.emit(["conversation", "remove"], {
									conversation: convo.id,
									message: op.target,
								});
								return;
							// }
							case ChatInputType.REACT:
								replyTo = (
									(await convo.feed.get(op.target as Buffer))
										.value as ChatMessage
								).sender;
								convo.emit(["conversation", "react"], {
									conversation: convo.id,
									target: op.target,
									replyTo,
									sender: op.sender,
									reaction: op.reaction,
								});
								return;
						}
					}
				}
			},
		);
		return convo;
	}

	async postMessage(message: {
		body: string;
		attachments?: string[];
		target?: Buffer;
	}): Promise<void> {
		const timestamp = Date.now();
		const sender = this.host.keyPair.publicKey;
		const hashes: ChatHash = {
			body: hash(Buffer.from(message.body || ""), null, 64),
			attachments: {},
		};
		const target = message.target || null;
		const attachments = message.attachments || [];
		const timeBuf = Buffer.allocUnsafe(8);
		timeBuf.writeBigUInt64BE(BigInt(timestamp));
		for (let attachment of attachments) {
			let i = BigInt(0);
			try {
				const hash = Buffer.allocUnsafe(64);
				const inst = Buffer.allocUnsafe(
					sodium.crypto_generichash_STATEBYTES,
				);
				sodium.crypto_generichash_init(inst, null, 64);
				for await (let chunk of fs.createReadStream(attachment)) {
					const no = Buffer.allocUnsafe(8);
					no.writeBigUInt64BE(i);
					const key = Buffer.concat([
						timeBuf,
						Buffer.from(path.basename(attachment)),
						no,
					]);
					await this.localStorage.put(key, chunk);
					sodium.crypto_generichash_update(inst, chunk);
					i++;
				}
				sodium.crypto_generichash_final(inst, hash);
				hashes.attachments[attachment] = hash;
			} catch (err) {
				console.error("Error reading attachment: " + attachment, err);
			}
		}
		await this.base.append(
			sign(
				ChatInput.encode({
					type: target ? ChatInputType.REPLY : ChatInputType.POST,
					sender,
					timestamp,
					hashes,
					target: target as any,
					body: message.body,
					attachments: attachments.map((a) => path.basename(a)),
				}),
				this.host.keyPair.secretKey,
			),
		);
	}

	async deleteMessage(target: Buffer): Promise<void> {
		const entry = await this.feed.get(target);
		if (entry) {
			const message: ChatMessage = entry.value as any;
			if (this.host.keyPair.publicKey.equals(message.sender)) {
				await this.base.append(
					sign(
						ChatInput.encode({
							type: ChatInputType.DELETE,
							sender: this.host.keyPair.publicKey,
							timestamp: 0,
							hashes: { body: null as any, attachments: {} },
							target,
							attachments: [],
						}),
						this.host.keyPair.secretKey,
					),
				);
			}
		}
	}

	async reactToMessage(target: Buffer, reaction?: string): Promise<void> {
		await this.base.append(
			sign(
				ChatInput.encode({
					type: ChatInputType.REACT,
					sender: this.host.keyPair.publicKey,
					timestamp: 0,
					hashes: { body: null as any, attachments: {} },
					target,
					reaction,
					attachments: [],
				}),
				this.host.keyPair.secretKey,
			),
		);
	}

	async latest(last?: Buffer, limit = 20): Promise<ChatMessage[]> {
		let prefix: Buffer;
		if (!last) {
			const timestamp = Buffer.allocUnsafe(8);
			timestamp.writeBigUInt64BE(BigInt(last || Date.now()));
			const suffix = Buffer.allocUnsafe(sodium.crypto_sign_BYTES).fill(
				0xff,
			);
			prefix = Buffer.concat([timestamp, suffix]);
		} else {
			prefix = last;
		}
		const stream = this.feed.createReadStream({
			lt: prefix,
			limit,
			reverse: true,
		});
		const messages: ChatMessage[] = [];
		for await (let { value } of stream) {
			messages.push(value);
		}
		return messages;
	}

	async extractAttachment(
		attachment: string,
		message: Buffer,
		prefix?: string,
	): Promise<string> {
		const entry = await this.feed.get(message);
		if (entry) {
			const msg: ChatMessage = entry.value as any;
			const root = path.join(
				prefix || path.join(this.host.prefix, "cache"),
				this.id.toString("hex"),
				msg.sender.toString("hex"),
			);
			const timestamp = Buffer.allocUnsafe(8);
			timestamp.writeBigUInt64BE(BigInt(msg.timestamp));
			const filename = path.join(
				root,
				`${timestamp.toString("hex")}-${attachment}`,
			);
			if (
				await fsp
					.access(filename)
					.then(() => true)
					.catch(() => false)
			) {
				return filename;
			}
			await fsp.mkdir(root, { recursive: true });
			let storage: HyperBee;
			if (this.storage.has(msg.sender.toString("hex"))) {
				storage = this.storage.get(msg.sender.toString("hex")) as any;
			} else {
				storage = new HyperBee(
					this.host.corestore.get(
						this.peers[msg.sender.toString("hex")].storage,
					),
				);
				this.storage.set(msg.sender.toString("hex"), storage);
			}
			const gt = Buffer.concat([timestamp, Buffer.from(attachment)]);
			const lte = Buffer.concat([gt, Buffer.allocUnsafe(8).fill(0xff)]);
			const rstream = storage.createReadStream({ gt, lte });
			const wstream = fs.createWriteStream(filename);
			for await (let chunk of rstream) {
				await new Promise<void>((resolve, reject) =>
					wstream.write(chunk.value, (err) => {
						if (err) {
							return reject(err);
						}
						resolve();
					}),
				);
			}
			await new Promise<void>((resolve) => wstream.end(resolve));
			return filename;
		}
		throw new MessageNotFound();
	}
}
