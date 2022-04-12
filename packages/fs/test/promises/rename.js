const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../../promises");

test("rename file", async (t) => {
	const oldp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const newp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(oldp, "");
	const err = await fs.rename(oldp, newp).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(newp));
	t.notOk(await RNFS.exists(oldp));
	t.end();
});

test("rename dir", async (t) => {
	const oldp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const newp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(oldp);
	const err = await fs.rename(oldp, newp).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(newp));
	t.notOk(await RNFS.exists(oldp));
	t.end();
});

test("rename overwrite", async (t) => {
	const oldp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const newp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(oldp, "");
	await RNFS.writeFile(newp, "");
	const err = await fs.rename(oldp, newp).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(newp));
	t.notOk(await RNFS.exists(oldp));
	t.end();
});

test("rename overwrite dir", async (t) => {
	const oldp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const newp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(oldp);
	await RNFS.mkdir(newp);
	const err = await fs.rename(oldp, newp).catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});

test("rename non-existing", async (t) => {
	const oldp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const newp = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await fs.rename(oldp, newp).catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});
