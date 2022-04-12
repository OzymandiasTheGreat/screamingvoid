const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../../promises");

test("opendir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	for (let i = 0; i < 10; i++) {
		await RNFS.writeFile(path.join(dir, nanoid(7)), "");
	}
	const content = await RNFS.readdir(dir);
	const dirobj = await fs.opendir(dir);
	let found = true;
	for await (let ent of dirobj) {
		found = content.includes(ent.name);
	}
	t.ok(found);
	t.end();
});
