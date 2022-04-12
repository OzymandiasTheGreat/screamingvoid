const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("stat file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const stat = await new Promise((resolve) =>
		fs.stat(file, (err, stat) => resolve(stat)),
	);
	t.ok(stat.isFile());
	t.notOk(stat.isDirectory());
	t.same(stat.size, 13);
	t.end();
});

test("stat dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const stat = await new Promise((resolve) =>
		fs.stat(dir, (err, stat) => resolve(stat)),
	);
	t.ok(stat.isDirectory());
	t.notOk(stat.isFile());
	t.ok(stat.mtime instanceof Date);
	t.same(typeof stat.mtimeMs, "number");
	t.end();
});

test("stat non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) =>
		fs.stat(file, (err) => resolve(err)),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});
