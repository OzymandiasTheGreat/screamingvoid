const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("exists", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	let exists = await new Promise((resolve) => fs.exists(file, resolve));
	t.notOk(exists);
	await RNFS.writeFile(file, "");
	exists = await new Promise((resolve) => fs.exists(file, resolve));
	t.ok(exists);
	t.end();
});
