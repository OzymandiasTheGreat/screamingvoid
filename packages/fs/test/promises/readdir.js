const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../../promises");

test("readdir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const items = await RNFS.readdir(dir);
	const files = await fs.readdir(dir);
	t.same(files, items);
	t.end();
});

test("readdir encoding", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const items = await RNFS.readdir(dir);
	const files = await fs.readdir(dir, "buffer");
	t.same(
		files,
		items.map((i) => Buffer.from(i)),
	);
	t.end();
});

test("readdir withFileTypes", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const items = await RNFS.readDir(dir);
	const files = await fs.readdir(dir, { withFileTypes: true });
	t.same(
		files.map((f) => f.name),
		items.map((i) => i.name),
	);
	t.end();
});
