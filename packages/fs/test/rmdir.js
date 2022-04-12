const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("rmdir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) => fs.rmdir(dir, resolve));
	t.error(err);
	t.notOk(await RNFS.exists(dir));
	t.end();
});

test("rmdir non-existing", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) => fs.rmdir(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});

test("rmdir file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) => fs.rmdir(file, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOTDIR");
	t.end();
});

test("rmdir not empty", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const err = await new Promise((resolve) => fs.rmdir(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOTEMPTY");
	t.end();
});

test("rmdir not empty recursive", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const err = await new Promise((resolve) =>
		fs.rmdir(dir, { recursive: true }, resolve),
	);
	t.error(err);
	t.notOk(await RNFS.exists(dir));
	t.end();
});
