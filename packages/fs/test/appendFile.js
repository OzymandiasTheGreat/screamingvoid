const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("appendFile", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const err = await new Promise((resolve) =>
		fs.appendFile(file, str2, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("appendFile non-existing", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const err1 = await new Promise((resolve) =>
		fs.appendFile(file, str1, resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.appendFile(file, str2, resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("appendFile fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const str3 = "Hej, Verden!";
	await RNFS.writeFile(file, str1);
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.appendFile(fd, str2, resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.writeFile(fd, str3, resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2 + str3);
	t.end();
});

test("appendFile bad fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.appendFile(fd, str2, resolve),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.same(await RNFS.readFile(file), "");
	t.end();
});
