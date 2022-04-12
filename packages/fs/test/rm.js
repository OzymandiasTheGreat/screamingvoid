const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("rm file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) => fs.rm(file, resolve));
	t.error(err);
	t.notOk(await RNFS.exists(file));
});

test("rm file non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) => fs.rm(file, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});

test("rm file non-existing force", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) =>
		fs.rm(file, { force: true }, resolve),
	);
	t.error(err);
	t.end();
});

test("rm empty dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) => fs.rm(dir, resolve));
	t.error(err);
	t.notOk(await RNFS.exists(dir));
	t.end();
});

test("rm non-empty dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const err = await new Promise((resolve) => fs.rm(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOTEMPTY");
	t.end();
});

test("rm non-empty dir recursive", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const err = await new Promise((resolve) =>
		fs.rm(dir, { recursive: true }, resolve),
	);
	t.error(err);
	t.notOk(await RNFS.exists(dir));
	t.end();
});
