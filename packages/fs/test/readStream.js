const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

const concat = async (stream) =>
	new Promise((resolve, reject) => {
		const bufs = [];
		stream.on("error", reject);
		stream.on("data", (buf) => bufs.push(buf));
		stream.on("end", () => resolve(Buffer.concat(bufs)));
	});

test("readStream", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const stream = fs.createReadStream(file);
	const out = await concat(stream);
	t.same(out, buf);
	t.end();
});

test("readStream encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const stream = fs.createReadStream(file, "hex");
	const out = await new Promise((resolve, reject) => {
		const strs = [];
		stream.on("error", reject);
		stream.on("data", (str) => strs.push(str));
		stream.on("end", () => resolve(strs.reduce((a, v) => a + v, "")));
	});
	t.same(out, buf.toString("hex"));
	t.end();
});

test("readStream big", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.alloc(128 * 1024).fill("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const stream = fs.createReadStream(file);
	const out = await concat(stream);
	t.same(out, buf);
	t.end();
});

test("readStream random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const stream = fs.createReadStream(file, { start: 1, end: 12 });
	const out = await concat(stream);
	t.same(out, buf.slice(1, 12));
	t.end();
});

test("readStream random access big", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.alloc(128 * 1024).fill("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const stream = fs.createReadStream(file, { start: 1, end: 96 * 1024 });
	const out = await concat(stream);
	t.same(out, buf.slice(1, 96 * 1024));
	t.end();
});

test("readStream fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const stream = fs.createReadStream("", { fd });
	const out = await concat(stream);
	t.same(out, buf);
	t.end();
});

test("readStream random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => resolve(fd)),
	);
	const stream = fs.createReadStream("", { fd, start: 1, end: 12 });
	const out = await concat(stream);
	t.same(out, buf.slice(1, 12));
	t.end();
});
