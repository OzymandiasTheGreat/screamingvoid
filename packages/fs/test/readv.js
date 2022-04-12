const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("readv", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out1 = Buffer.alloc(7);
	const out2 = Buffer.alloc(6);
	const err = await new Promise((resolve) =>
		fs.readv(fd, [out1, out2], (err) => resolve(err)),
	);
	t.error(err);
	t.same(out1, buf.slice(0, 7));
	t.same(out2, buf.slice(7, 13));
	t.end();
});

test("readv position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out1 = Buffer.alloc(5);
	const out2 = Buffer.alloc(6);
	const err = await new Promise((resolve) =>
		fs.readv(fd, [out1, out2], 2, (err) => resolve(err)),
	);
	t.error(err);
	t.same(out1, buf.slice(2, 7));
	t.same(out2, buf.slice(7, 13));
	t.end();
});
