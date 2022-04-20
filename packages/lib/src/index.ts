import path from "path";
import fs from "fs";
import Hyperswarm from "hyperswarm";
import Corestore from "corestore";
import HyperBee from "hyperbee";
import { HyperbeeLiveStream } from "@geut/hyperbee-live-stream";

export const id: Record<string, { publicKey: Buffer; secretKey: Buffer }> = {};

const fixtures = path.join(__dirname, "../../fixtures");

for (let f of fs.readdirSync(fixtures, { withFileTypes: true })) {
	if (f.isFile()) {
		const json = JSON.parse(
			fs.readFileSync(path.join(fixtures, f.name), "utf8"),
		);
		id[f.name] = {
			publicKey: Buffer.from(json.pk, "hex"),
			secretKey: Buffer.from(json.sk, "hex"),
		};
	}
}

let swarm: Hyperswarm;
let bee: HyperBee;

export function init(keyPair: any) {
	swarm = new Hyperswarm({ keyPair });

	const corestore = new Corestore(
		path.join(fixtures, keyPair.publicKey.toString("hex")),
	);
	const core = corestore.get({ keyPair });
	bee = new HyperBee(core, { keyEncoding: "utf8", valueEncoding: "utf8" });

	swarm.on("connection", (sock, info) => {
		sock.pipe(core.replicate(info.client)).pipe(sock);
		console.log("Connected to ", info.publicKey);
	});
}

export function join(pk: Buffer) {
	swarm.join(pk);
}

export function stream(opts: any) {
	const stream = new HyperbeeLiveStream(bee, opts);
	stream.on("data", console.log);
}

export function put(key: string, value: string) {
	bee.put(key, value);
}

export function del(key: string) {
	bee.del(key);
}
