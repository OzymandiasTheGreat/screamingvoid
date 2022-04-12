const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../../promises");

const concat = async (stream) =>
	new Promise((resolve, reject) => {
		const bufs = [];
		stream.on("error", reject);
		stream.on("data", (buf) => bufs.push(buf));
		stream.on("end", () => resolve(Buffer.concat(bufs)));
	});

test("close", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const handle = await fs.open(file, "w");
	const err1 = await handle.close().catch((err) => err);
	const err2 = await handle.close().catch((err) => err);
	t.error(err1);
	t.ok(err2 instanceof Error);
	t.same(err2.code, "EBADF");
	t.end();
});

test("read", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const out = Buffer.alloc(buf.byteLength);
	const err = await handle.read({ buffer: out }).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(out, buf);
	t.end();
});

test("read random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const out = Buffer.alloc(3);
	const err = await handle
		.read({ buffer: out, position: 2 })
		.catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(out, buf.slice(2, 5));
	t.end();
});

test("readFile handle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const out = await handle.readFile();
	t.same(out, buf);
	t.end();
});

test("readFile handle position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	await handle.read({ length: 7 });
	const out = await handle.readFile();
	t.same(out, buf.slice(7));
	t.end();
});

test("readStream handle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const stream = handle.createReadStream();
	const out = await concat(stream);
	t.same(out, buf);
	t.end();
});

test("readStream random access", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const stream = handle.createReadStream({ start: 1, end: 12 });
	const out = await concat(stream);
	t.same(out, buf.slice(1, 12));
	t.end();
});

test("readv", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const out1 = Buffer.alloc(7);
	const out2 = Buffer.alloc(6);
	const err = await handle.readv([out1, out2]).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(out1, buf.slice(0, 7));
	t.same(out2, buf.slice(7, 13));
	t.end();
});

test("readv position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r");
	const out1 = Buffer.alloc(5);
	const out2 = Buffer.alloc(6);
	const err = await handle.readv([out1, out2], 2).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(out1, buf.slice(2, 7));
	t.same(out2, buf.slice(7, 13));
	t.end();
});

test("truncate", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "w");
	const err = await handle.truncate().catch((err) => err);
	t.error(err);
	t.same((await RNFS.stat(file)).size, 0);
	t.end();
});

test("truncate length", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	await RNFS.writeFile(file, buf.toString());
	const handle = await fs.open(file, "r+");
	const err = await handle.truncate(5).catch((err) => err);
	t.error(err);
	t.same((await RNFS.stat(file)).size, 5);
	t.same(await RNFS.readFile(file), buf.slice(0, 5).toString());
	t.end();
});

test("utimes", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const time = new Date("1992-06-13");
	const handle = await fs.open(file, "w");
	const err = await handle.utimes(time, time);
	t.error(err);
	t.same((await RNFS.stat(file)).mtime, time);
	t.end();
});

test("write full signature buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err = await handle
		.write(buf, 0, buf.byteLength, 0)
		.catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write full signature buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const handle = await fs.open(file, "w");
	const err1 = await handle
		.write(buf1, 0, buf1.byteLength, 0)
		.catch((err) => err);
	const err2 = await handle
		.write(buf2, 0, buf2.byteLength, buf1.byteLength)
		.catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write full signature buffer position middle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err1 = await handle
		.write(buf1, 0, buf1.byteLength, 0)
		.catch((err) => err);
	const err2 = await handle
		.write(buf2, 0, buf2.byteLength, 2)
		.catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	buf1.set(buf2, 2);
	t.same(await RNFS.readFile(file), buf1.toString());
	t.end();
});

test("write full signature buffer bad fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const buf = Buffer.from("Sveikas, Pasauli");
	const handle = await fs.open(file, "r");
	const err = await handle
		.write(buf, 0, buf.byteLength, 0)
		.catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.end();
});

test("write 3 args buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err = await handle.write(buf, 0, buf.byteLength).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 3 args buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const handle = await fs.open(file, "w");
	const err1 = await handle
		.write(buf1, 0, buf1.byteLength)
		.catch((err) => err);
	const err2 = await handle
		.write(buf2, 0, buf2.byteLength)
		.catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write 2 args buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err = await handle.write(buf, 0).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 2 args buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err1 = await handle.write(buf1, 0).catch((err) => err);
	const err2 = await handle.write(buf2, 2).catch((err) => err);
	console.log(err2);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	buf1.set(buf2, 2);
	t.same(await RNFS.readFile(file), buf1.toString());
	t.end();
});

test("write 1 arg buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err = await handle.write(buf).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("write 1 arg buffer position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Sveikas, Pasauli!");
	const buf2 = Buffer.from("Hello, World!");
	const handle = await fs.open(file, "w");
	const err1 = await handle.write(buf1).catch((err) => err);
	const err2 = await handle.write(buf2).catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("write 4 args string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const handle = await fs.open(file, "w");
	const err = await handle.write(str, 0, str.length, 0).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 4 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const handle = await fs.open(file, "w");
	const err1 = await handle
		.write(str1, 0, str1.length, 0)
		.catch((err) => err);
	const err2 = await handle
		.write(str2, 0, str2.length, str1.length)
		.catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("write 3 args string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const handle = await fs.open(file, "w");
	const err = await handle.write(str, 0, "utf8").catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 3 args string encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str = "Hello, World!";
	const handle = await fs.open(file, "w");
	const err = await handle
		.write(Buffer.from(str).toString("hex"), 0, "hex")
		.catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("write 3 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const handle = await fs.open(file, "w");
	const err1 = await handle.write(str1, 0, "utf8").catch((err) => err);
	const err2 = await handle.write(str2, 7, "utf8").catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), str1.slice(0, 7) + str2);
	t.end();
});

test("write 2 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const handle = await fs.open(file, "w");
	const err1 = await handle.write(str1, 0).catch((err) => err);
	const err2 = await handle.write(str2, 7).catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), str1.slice(0, 7) + str2);
	t.end();
});

test("write 1 args string position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli";
	const handle = await fs.open(file, "w");
	const err1 = await handle.write(str1).catch((err) => err);
	const err2 = await handle.write(str2).catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("writeFile handle string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const handle = await fs.open(file, "w");
	const str = "Hello, World!";
	const err = await handle.writeFile(str).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), str);
	t.end();
});

test("writeFile handle buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const handle = await fs.open(file, "w");
	const buf = Buffer.from("Hello, World!");
	const err = await handle.writeFile(buf).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf.toString());
	t.end();
});

test("writeFile non-writable handle string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const handle = await fs.open(file, "r");
	const str = "Hello, World!";
	const err = await handle.writeFile(str).catch((err) => err);
	t.ok(err instanceof Error);
	t.same(err.code, "EBADF");
	t.end();
});

test("writeFile append handle string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	await RNFS.writeFile(file, str1);
	const handle = await fs.open(file, "a");
	const err = await handle.writeFile(str2).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), str1 + str2);
	t.end();
});

test("writeFile append handle buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	await RNFS.writeFile(file, buf1.toString());
	const handle = await fs.open(file, "a");
	const err = await handle.writeFile(buf2).catch((err) => err);
	t.error(err);
	t.same(await RNFS.readFile(file), Buffer.concat([buf1, buf2]).toString());
	t.end();
});

test("writeStream handle", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const handle = await fs.open(file, "w");
	const stream = handle.createWriteStream();
	stream.on("error", t.error);
	stream.write(buf1);
	stream.write(buf2);
	await new Promise((resolve) => stream.end(buf3, resolve));
	t.same(
		await RNFS.readFile(file),
		Buffer.concat([buf1, buf2, buf3]).toString(),
	);
	t.end();
});

test("writeStream handle append", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	await RNFS.writeFile(file, buf1.toString());
	const handle = await fs.open(file, "a");
	const stream = handle.createWriteStream();
	stream.on("error", t.error);
	stream.write(buf2);
	await new Promise((resolve) => stream.end(buf3, resolve));
	t.same(
		await RNFS.readFile(file),
		Buffer.concat([buf1, buf2, buf3]).toString(),
	);
	t.end();
});

test("writev", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const handle = await fs.open(file, "w");
	const err = await handle.writev([buf1, buf2], 0).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(await RNFS.readFile(file), buf1.toString() + buf2.toString());
	t.end();
});

test("writev position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, ");
	const buf2 = Buffer.from("World!");
	const buf3 = Buffer.from("Sveikas, ");
	const buf4 = Buffer.from("Pasauli!");
	const handle = await fs.open(file, "w");
	const err1 = await handle.writev([buf1, buf2], 0).catch((err) => err);
	const err2 = await handle.writev([buf3, buf4], 0).catch((err) => err);
	t.notOk(err1 instanceof Error);
	t.notOk(err2 instanceof Error);
	t.same(await RNFS.readFile(file), buf3.toString() + buf4.toString());
	t.end();
});

test("writev auto position", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const handle = await fs.open(file, "w");
	await handle.write(buf1);
	const err = await handle.writev([buf2, buf3]).catch((err) => err);
	t.notOk(err instanceof Error);
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
	const handle = await fs.open(file, "a");
	const err = await handle.writev([buf2, buf3]).catch((err) => err);
	t.notOk(err instanceof Error);
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});

test("stat file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const handle = await fs.open(file, "r");
	const stat = await handle.stat();
	t.ok(stat.isFile());
	t.notOk(stat.isDirectory());
	t.same(stat.size, 13);
	t.end();
});

// Can't have handle on a dir
// test("stat dir", async (t) => {
// 	const dir = path.join(RNFS.CachesDirectoryPath, nanoid(7));
// 	await RNFS.mkdir(dir);
// 	const handle = await fs.open(dir, "r");
// 	const stat = await handle.stat();
// 	t.ok(stat.isDirectory());
// 	t.notOk(stat.isFile());
// 	t.ok(stat.mtime instanceof Date);
// 	t.same(typeof stat.mtimeMs, "number");
// 	t.end();
// });
