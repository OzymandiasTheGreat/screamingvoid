const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("writeStream string", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const str1 = "Hello, World!";
	const str2 = "Sveikas, Pasauli!";
	const str3 = "Hej, Verden!";
	const stream = fs.createWriteStream(file);
	stream.on("error", t.error);
	stream.write(str1);
	stream.write(str2);
	await new Promise((resolve) => stream.end(str3, resolve));
	t.same(await RNFS.readFile(file), str1 + str2 + str3);
	t.end();
});

test("writeStream buffer", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const stream = fs.createWriteStream(file);
	stream.on("error", t.error);
	stream.write(buf1);
	stream.write(buf2);
	await new Promise((resolve) => stream.end(buf3, resolve));
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});

test("writeStream encoding", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const stream = fs.createWriteStream(file, "hex");
	stream.on("error", t.error);
	stream.write(buf1.toString("hex"));
	stream.write(buf2.toString("hex"));
	await new Promise((resolve) => stream.end(buf3.toString("hex"), resolve));
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});

test("writeStream options", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	await RNFS.writeFile(file, buf1.toString());
	const stream = fs.createWriteStream(file, {
		encoding: "hex",
		start: buf1.byteLength,
	});
	stream.on("error", t.error);
	stream.write(buf2.toString("hex"));
	await new Promise((resolve) => stream.end(buf3.toString("hex"), resolve));
	t.same(
		await RNFS.readFile(file),
		buf1.toString() + buf2.toString() + buf3.toString(),
	);
	t.end();
});

test("writeStream fd", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const stream = fs.createWriteStream("", { fd });
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

test("writeStream fd append", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	await RNFS.writeFile(file, buf1.toString());
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => resolve(fd)),
	);
	const stream = fs.createWriteStream("", { fd });
	stream.on("error", t.error);
	stream.write(buf2);
	await new Promise((resolve) => stream.end(buf3, resolve));
	t.same(
		await RNFS.readFile(file),
		Buffer.concat([buf1, buf2, buf3]).toString(),
	);
	t.end();
});

test("writeStream append", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const buf1 = Buffer.from("Hello, World!");
	const buf2 = Buffer.from("Sveikas, Pasauli!");
	const buf3 = Buffer.from("Hej, Verden!");
	await RNFS.writeFile(file, buf1.toString());
	const stream = fs.createWriteStream(file, { flags: "a" });
	stream.on("error", t.error);
	stream.write(buf2);
	await new Promise((resolve) => stream.end(buf3, resolve));
	t.same(
		await RNFS.readFile(file),
		Buffer.concat([buf1, buf2, buf3]).toString(),
	);
	t.end();
});
