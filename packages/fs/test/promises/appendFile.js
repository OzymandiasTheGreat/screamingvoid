const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../../promises");

test("appendFile", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const err = await fs.appendFile(file, str2).catch((err) => err);
	t.error(err);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("appendFile non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const err1 = await fs.appendFile(file, str1).catch((err) => err);
	const err2 = await fs.appendFile(file, str2).catch((err) => err);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("appendFile handle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const str3 = "Hej, Verden!";
	await RNFS.writeFile(file, str1);
	const handle = await fs.open(file, "a");
	const err1 = await fs.appendFile(handle, str2).catch((err) => err);
	const err2 = await fs.appendFile(handle, str3).catch((err) => err);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2 + str3);
	t.end();
});

test("appendFile bad handle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const handle = await fs.open(file, "w");
	const err = await fs.appendFile(handle, str2).catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.same(await RNFS.readFile(file), "");
	t.end();
});
