const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("readFile", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await new Promise((resolve) =>
		fs.readFile(file, (err, data) => resolve(data)),
	);
	t.same(out, buf);
	t.end();
});

test("readFile encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await new Promise((resolve) =>
		fs.readFile(file, "hex", (err, data) => resolve(data)),
	);
	t.same(out, buf.toString("hex"));
	t.end();
});

test("readFile encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const out = await new Promise((resolve) =>
		fs.readFile(file, { encoding: "hex" }, (err, data) => resolve(data)),
	);
	t.same(out, buf.toString("hex"));
	t.end();
});

test("readFile fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const out = await new Promise((resolve, reject) =>
		fs.readFile(fd, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		}),
	);
	t.same(out, buf);
	t.end();
});

test("readFile fd position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	await new Promise((resolve) =>
		fs.read(fd, { length: 7 }, () => resolve()),
	);
	const out = await new Promise((resolve, reject) =>
		fs.readFile(fd, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		}),
	);
	t.same(out, buf.slice(7));
	t.end();
});
