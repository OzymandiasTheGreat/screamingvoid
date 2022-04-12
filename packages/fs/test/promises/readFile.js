const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../../promises");

test("readFile", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await fs.readFile(file);
	t.same(out, buf);
	t.end();
});

test("readFile encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await fs.readFile(file, "hex");
	t.same(out, buf.toString("hex"));
	t.end();
});

test("readFile encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await fs.readFile(file, { encoding: "hex" });
	t.same(out, buf.toString("hex"));
	t.end();
});
