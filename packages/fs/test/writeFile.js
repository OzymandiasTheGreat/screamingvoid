const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("writeFile string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const err = await new Promise((resolve) =>
		fs.writeFile(file, str, resolve),
	);
	t.error(err);
	t.ok(await RNFS.exists(file));
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const err = await new Promise((resolve) =>
		fs.writeFile(file, buf, resolve),
	);
	t.error(err);
	t.ok(await RNFS.exists(file));
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("writeFile overwrite existing file string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const str = "Sveikas, Pasauli!";
	const err = await new Promise((resolve) =>
		fs.writeFile(file, str, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile overwrite existing file buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const buf = Buffer.from("Sveikas, Pasauli!");
	const err = await new Promise((resolve) =>
		fs.writeFile(file, buf, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("writeFile fd string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const str = "Hello, World!";
	const err = await new Promise((resolve) => fs.writeFile(fd, str, resolve));
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile fd buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const buf = Buffer.from("Hello, World!");
	const err = await new Promise((resolve) => fs.writeFile(fd, buf, resolve));
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("writeFile non-writable fd string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const fd = await new Promise((resolve) =>
		fs.open(file, "r", (err, fd) => resolve(fd)),
	);
	const str = "Hello, World!";
	const err = await new Promise((resolve) => fs.writeFile(fd, str, resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.end();
});

test("writeFile append fd string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.writeFile(fd, str2, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("writeFile append fd buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	await RNFS.writeFile(file, buf1.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.writeFile(fd, buf2, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), Buffer.concat([buf1, buf2]).toString());
	t.end();
});

test("write file encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const err = await new Promise((resolve) =>
		fs.writeFile(file, buf.toString("hex"), "hex", resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write file dir", async (t) => {
	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(dir);
	const err = await new Promise((resolve) => fs.writeFile(dir, "", resolve));
	t.ok(err instanceof Error);
	t.same(err.code, "EISDIR");
	t.end();
});
