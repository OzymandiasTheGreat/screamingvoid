const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("Open existing file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	t.end();
});

test("Open non-existing file", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const err = await new Promise((resolve) =>
		fs.open(file, (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "ENOENT");
	t.end();
});

test("Open existing file in write mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	const content = await RNFS.readFile(file);
	t.same(content, "", "truncates");
	t.end();
});

test("Open non-existing file in write mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => {
			if (err) {
				console.log(err);
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	t.end();
});

test("Open existing file in append mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "Hello, World!");
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	const content = await RNFS.readFile(file);
	t.same(content, "Hello, World!", "does not truncate");
	t.end();
});

test("Open non-existing file in append mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "a", (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	t.end();
});

test("Open existing file in create mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(file, "");
	const err = await new Promise((resolve) =>
		fs.open(file, "wx", (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.ok(err instanceof Error);
	t.same(err.code, "EEXIST");
	t.end();
});

test("Open non-existing file in create mode", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "wx", (err, fd) => {
			if (err) {
				return resolve(err);
			}
			resolve(fd);
		}),
	);
	t.same(typeof fd, "number");
	t.ok(fd > 0);
	t.ok(await RNFS.exists(file));
	t.end();
});
