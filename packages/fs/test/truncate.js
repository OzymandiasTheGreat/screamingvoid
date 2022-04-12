const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("truncate", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const err = await new Promise((resolve) => fs.truncate(file, resolve));
	t.error(err);
	t.same((await RNFS.stat(file)).size, 0);
	t.end();
});

test("truncate length", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const err = await new Promise((resolve) => fs.truncate(file, 5, resolve));
	t.error(err);
	t.same((await RNFS.stat(file)).size, 5);
	t.same(await RNFS.readFile(file), buf.slice(0, 5).toString());
	t.end();
});
