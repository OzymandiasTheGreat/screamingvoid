const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("../");

test("mkdtemp", async (t) => {
	const prefix = "hello-";
	const dir = await new Promise((resolve, reject) =>
		fs.mkdtemp(prefix, (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		}),
	);
	t.ok(RNFS.exists(dir));
	t.ok(dir.startsWith(path.join(RNFS.TemporaryDirectoryPath, prefix)));
	t.end();
});

test("mkdtemp encoding", async (t) => {
	const prefix = Buffer.from("hello-");
	const dir = await new Promise((resolve, reject) =>
		fs.mkdtemp(prefix.toString("hex"), "hex", (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		}),
	);
	t.ok(RNFS.exists(dir));
	t.ok(
		dir.startsWith(
			path.join(RNFS.TemporaryDirectoryPath, prefix.toString()),
		),
	);
	t.end();
});

test("mkdtemp subdir", async (t) => {
	const prefix = "hello" + path.sep;
	const dir = await new Promise((resolve, reject) =>
		fs.mkdtemp(prefix, (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		}),
	);
	t.ok(RNFS.exists(dir));
	t.ok(dir.startsWith(path.join(RNFS.TemporaryDirectoryPath, prefix)));
	t.end();
});
