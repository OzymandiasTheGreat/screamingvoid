const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("write full signature buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, buf, 0, buf.byteLength, 0, (err) => resolve(err)),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write full signature buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, buf1, 0, buf1.byteLength, 0, (err) => resolve(err)),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, buf2, 0, buf2.byteLength, buf1.byteLength, (err) =>
			resolve(err),
		),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write full signature buffer position middle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, buf1, 0, buf1.byteLength, 0, (err) => resolve(err)),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, buf2, 0, buf2.byteLength, 2, (err) => resolve(err)),
	);
	t.error(err1);
	t.error(err2);
	buf1.set(buf2, 2);
	t.same(await RNFS.readFile(file), buf1.toString());
	t.end();
});

test("write full signature buffer bad fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const buf = Buffer.from("Sveikas, Pasauli");
	const fd = await new Promise((resolve) =>
		fs.open(file, "r", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, buf, 0, buf.byteLength, 0, (err) => resolve(err)),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.end();
});

test("write 5 args buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, buf, 0, buf.byteLength, (err) => resolve(err)),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 5 args buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, buf1, 0, buf1.byteLength, (err) => resolve(err)),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, buf2, 0, buf2.byteLength, (err) => resolve(err)),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write 4 args buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, buf, 0, (err) => resolve(err)),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 4 args buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, buf1, 0, (err) => resolve(err)),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, buf2, 2, (err) => resolve(err)),
	);
	t.error(err1);
	t.error(err2);
	buf1.set(buf2, 2);
	t.same(await RNFS.readFile(file), buf1.toString());
	t.end();
});

test("write 3 args buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, buf, (err) => resolve(err)),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 3 args buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, buf1, (err) => resolve(err)),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, buf2, (err) => resolve(err)),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write 6 args string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, str, 0, str.length, 0, resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 6 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, str1, 0, str1.length, 0, resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, str2, 0, str2.length, str1.length, resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("write 5 args string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, str, 0, "utf8", resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 5 args string encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err = await new Promise((resolve) =>
		fs.write(fd, Buffer.from(str).toString("hex"), 0, "hex", resolve),
	);
	t.error(err);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 5 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, str1, 0, "utf8", resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, str2, 7, "utf8", resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1.slice(0, 7) + str2);
	t.end();
});

test("write 4 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) =>
		fs.write(fd, str1, 0, resolve),
	);
	const err2 = await new Promise((resolve) =>
		fs.write(fd, str2, 7, resolve),
	);
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1.slice(0, 7) + str2);
	t.end();
});

test("write 3 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli";
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) => fs.write(fd, str1, resolve));
	const err2 = await new Promise((resolve) => fs.write(fd, str2, resolve));
	t.error(err1);
	t.error(err2);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});
