import fs from "fs";
import sodium from "sodium-universal";

const IDs: Record<string, { publicKey: string; secretKey: string }> = {};

for (let i = 97; i <= 122; i++) {
	const id = String.fromCharCode(i);
	const pk = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
	const sk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
	sodium.crypto_sign_keypair(pk, sk);
	IDs[id] = { publicKey: pk.toString("hex"), secretKey: sk.toString("hex") };
}

fs.writeFileSync("fixtures/ids.json", JSON.stringify(IDs), "utf8");
