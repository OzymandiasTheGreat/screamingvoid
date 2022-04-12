const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("unlink", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) => fs.unlink(file, resolve));
	t.error(err);
	t.notOk(await RNFS.exists(file));
	t.end();
});

test("unlink non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) => fs.unlink(file, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});

test("unlink dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) => fs.unlink(dir, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});
