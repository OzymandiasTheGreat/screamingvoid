const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("realpath", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const realpath = await new Promise((resolve, reject) =>
		fs.realpath(file, (err, realpath) => {
			if (err) {
				return reject(err);
			}
			resolve(realpath);
		}),
	);
	t.same(realpath, (await RNFS.stat(file)).originalFilepath);
	t.end();
});

test("realpath non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) =>
		fs.realpath(file, (err) => resolve(err)),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});
