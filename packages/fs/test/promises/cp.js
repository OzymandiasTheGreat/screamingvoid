const test = require("tape");
const { nanoid } = require("nanoid/non-secure");
const RNFS = require("react-native-fs");
const path = require("path");
const fs = require("../../promises");

test("cp file", async (t) => {
	const src = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const dest = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.writeFile(src, "Hello, World!");
	const err = await fs.cp(src, dest).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(dest));
	t.same(await RNFS.readFile(dest), "Hello, World!");
	t.end();
});

test("cp dir", async (t) => {
	const src = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const dest = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(src);
	const err = await fs.cp(src, dest).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(dest));
	t.end();
});

test("cp dir tree", async (t) => {
	const src = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const srcF1 = path.join(src, nanoid(7));
	const srcD1 = path.join(src, nanoid(7));
	const srcF2 = path.join(srcD1, nanoid(7));
	const dest = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(src);
	await RNFS.mkdir(srcD1);
	await RNFS.writeFile(srcF1, "Hello, World!");
	await RNFS.writeFile(srcF2, "Sveikas, Pasauli!");
	const err = await fs.cp(src, dest).catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(path.join(dest, path.basename(srcF1))));
	t.ok(await RNFS.exists(path.join(dest, path.basename(srcD1))));
	t.ok(
		!(await RNFS.exists(
			path.join(dest, path.basename(srcD1), path.basename(srcF2)),
		)),
	);
	t.end();
});

test("cp dir tree recursive", async (t) => {
	const src = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	const srcF1 = path.join(src, nanoid(7));
	const srcD1 = path.join(src, nanoid(7));
	const srcF2 = path.join(srcD1, nanoid(7));
	const srcD2 = path.join(srcD1, nanoid(7));
	const srcF3 = path.join(srcD2, nanoid(7));
	const dest = path.join(RNFS.CachesDirectoryPath, nanoid(7));
	await RNFS.mkdir(src);
	await RNFS.mkdir(srcD1);
	await RNFS.mkdir(srcD2);
	await RNFS.writeFile(srcF1, "Hello, World!");
	await RNFS.writeFile(srcF2, "Sveikas, Pasauli!");
	await RNFS.writeFile(srcF3, "Hej, Verden!");
	const err = await fs
		.cp(src, dest, { recursive: true })
		.catch((err) => err);
	t.error(err);
	t.ok(await RNFS.exists(path.join(dest, path.basename(srcF1))));
	t.ok(await RNFS.exists(path.join(dest, path.basename(srcD1))));
	t.ok(
		await RNFS.exists(
			path.join(dest, path.basename(srcD1), path.basename(srcF2)),
		),
	);
	t.ok(
		await RNFS.exists(
			path.join(dest, path.basename(srcD1), path.basename(srcD2)),
			path.basename(srcF3),
		),
	);
	t.end();
});
