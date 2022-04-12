const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../");

test("close", async (t) => {
	const file = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const fd = await new Promise((resolve) =>
		fs.open(file, "w", (err, fd) => resolve(fd)),
	);
	const err1 = await new Promise((resolve) => fs.close(fd, resolve));
	const err2 = await new Promise((resolve) => fs.close(fd, resolve));
	t.error(err1);
	t.ok(err2 instanceof Error);
	t.same(err2.code, "EBADF");
	t.end();
});
