const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const { linux } = require("filesystem-constants");
const fs = require("..");

test("copyFile", async (t) => {
	const file1 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const file2 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file1, "Hello, World!");
	const err = await new Promise((resolve) =>
		fs.copyFile(file1, file2, resolve),
	);
	t.error(err);
	t.ok(await RNFS.exists(file2));
	t.end();
});

test("copyFile overwrite", async (t) => {
	const file1 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const file2 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file1, "Hello, World!");
	await RNFS.writeFile(file2, "Sveikas, Pasauli!");
	const err = await new Promise((resolve) =>
		fs.copyFile(file1, file2, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file2), "Hello, World!");
	t.end();
});

test("copyFile overwrite exclusive", async (t) => {
	const file1 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const file2 = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file1, "Hello, World!");
	await RNFS.writeFile(file2, "Sveikas, Pasauli!");
	const err = await new Promise((resolve) =>
		fs.copyFile(file1, file2, linux.COPYFILE_EXCL, resolve),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EEXIST");
	t.same(await RNFS.readFile(file2), "Sveikas, Pasauli!");
	t.end();
});

test("copyFile src dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) =>
		fs.copyFile(dir, file, resolve),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});

test("copyFile dest dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) =>
		fs.copyFile(file, dir, resolve),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});
