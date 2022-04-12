const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("writev", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.writev(fd, [buf1, buf2], 0, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("writev position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const buf3 = Buffer.from("Sveikas, ");
	const buf4 = Buffer.from("Pasauli!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.writev(fd, [buf1, buf2], 0, resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.writev(fd, [buf3, buf4], 0, resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), buf3.toString() + buf4.toString());
	t.end();
});

test("writev auto position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	await new Promise((resolve) => fs.write(fd, buf1, resolve));
	const err = await new Promise((resolve) =>
		fs.writev(fd, [buf2, buf3], resolve),
	);
	t.error(err);
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});

test("writev append", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	await RNFS.writeFile(file, buf1.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.writev(fd, [buf2, buf3], resolve),
	);
	t.error(err);
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});
