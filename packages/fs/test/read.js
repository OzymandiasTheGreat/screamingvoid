const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("read", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out = Buffer.alloc(buf.byteLength);
	const err = await new Promise((resolve) =>
		fs.read(fd, out, 0, out.byteLength, 0, (err) => resolve(err)),
	);
	t.error(err);
	t.same(out, buf);
	t.end();
});

test("read random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out = Buffer.alloc(3);
	const err = await new Promise((resolve) =>
		fs.read(fd, out, 0, out.byteLength, 2, (err) => resolve(err)),
	);
	t.error(err);
	t.same(out, buf.slice(2, 5));
	t.end();
});

test("read options", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out = Buffer.alloc(buf.byteLength);
	const err = await new Promise((resolve) =>
		fs.read(fd, { buffer: out }, (err) => resolve(err)),
	);
	t.error(err);
	t.same(out, buf);
	t.end();
});

test("read options random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out = Buffer.alloc(3);
	const err = await new Promise((resolve) =>
		fs.read(fd, { buffer: out, position: 2 }, (err) => resolve(err)),
	);
	t.error(err);
	t.same(out, buf.slice(2, 5));
	t.end();
});
