const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("utimes", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const time = new Date("1992-06-13");
	const err = await new Promise((resolve) =>
		fs.utimes(file, time, time, resolve),
	);
	t.error(err);
	t.same((await RNFS.stat(file)).mtime, time);
	t.end();
});
