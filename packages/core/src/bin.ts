import fs from "fs";

const json: Record<string, { publicKey: string; secretKey: string }> =
	JSON.parse(fs.readFileSync("fixtures/ids.json", "utf8"));
const IDs: Record<string, any> = {};
for (let [_, kp] of Object.entries(json)) {
	IDs[_] = {
		publicKey: Buffer.from(kp.publicKey, "hex"),
		secretKey: Buffer.from(kp.secretKey, "hex"),
	};
}
export { IDs };
export * from "./index";
