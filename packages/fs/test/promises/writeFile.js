const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../../promises");

test("writeFile string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const err = await fs.writeFile(file, str).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(file));
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const err = await fs.writeFile(file, buf).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(file));
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("writeFile overwrite existing file string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const str = "Sveikas, Pasauli!";
	const err = await fs.writeFile(file, str).catch((err) => err);
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile overwrite existing file buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const buf = Buffer.from("Sveikas, Pasauli!");
	const err = await fs.writeFile(file, buf).catch((err) => err);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write file encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const err = await fs
		.writeFile(file, buf.toString("hex"), "hex")
		.catch((err) => err);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write file dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await fs.writeFile(dir, "").catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});
