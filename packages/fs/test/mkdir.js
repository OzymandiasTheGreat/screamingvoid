const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("mkdir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) => fs.mkdir(dir, resolve));
	t.error(err);
	t.ok(await RNFS.exists(dir));
	t.end();
});

test("mkdir existing", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) => fs.mkdir(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "EEXIST");
	t.end();
});

test("mkdir existing recursive", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) =>
		fs.mkdir(dir, { recursive: true }, resolve),
	);
	t.error(err);
	t.end();
});

test("mkdir parents", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7), nanoid(7));
	const err = await new Promise((resolve) => fs.mkdir(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.notOk(await RNFS.exists(dir));
	t.end();
});

test("mkdir parents recursive", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7), nanoid(7));
	const err = await new Promise((resolve) =>
		fs.mkdir(dir, { recursive: true }, resolve),
	);
	t.error(err);
	t.ok(await RNFS.exists(dir));
	t.end();
});
