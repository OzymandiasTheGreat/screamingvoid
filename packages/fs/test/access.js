const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) => fs.access(file, resolve));
	t.error(err);
	t.end();
});

test("access non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) => fs.access(file, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});
