const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../../promises");

test("rm file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await fs.rm(file).catch((err) => err);
	t.error(err);
	t.notOk(await RNFS.exists(file));
});

test("rm file non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await fs.rm(file).catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});

test("rm file non-existing force", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await fs.rm(file, { force: true }).catch((err) => err);
	t.error(err);
	t.end();
});

test("rm empty dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await fs.rm(dir).catch((err) => err);
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
	const err = await fs.rm(dir).catch((err) => err);
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
	const err = await fs.rm(dir, { recursive: true }).catch((err) => err);
	t.error(err);
	t.notOk(await RNFS.exists(dir));
	t.end();
});
