import fs from "fs";

const json: { publicKey: string; secretKey: string }[] = JSON.parse(
	fs.readFileSync("fixtures/ids", "utf8"),
);
const IDs = [];
for (let kp of json) {
	IDs.push({
		publicKey: Buffer.from(kp.publicKey, "hex"),
		secretKey: Buffer.from(kp.secretKey, "hex"),
	});
}
export { IDs };
