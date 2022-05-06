import fs from "fs";

const json: Record<
	string,
	{
		key: string;
		keyPair: { publicKey: string; secretKey: string };
	}
> = JSON.parse(fs.readFileSync("fixtures/ids", "utf8"));
const IDs: Record<string, any> = {};
for (let [_, kp] of Object.entries(json)) {
	IDs[_] = {
		key: Buffer.from(kp.key, "hex"),
		keyPair: {
			publicKey: Buffer.from(kp.keyPair.publicKey, "hex"),
			secretKey: Buffer.from(kp.keyPair.secretKey, "hex"),
		},
	};
}
export { IDs };
export * from "./index";
