const fs = require("fs");
const path = require("path");
const nanoid = require("nanoid/non-secure").nanoid;
const sodium = require("sodium-universal");
const tape = require("tape");
const suite = require("abstract-leveldown/test");
const leveldown = require("leveldown");
const encryptdown = require("../").EncryptDown;

suite({
	test: tape,
	factory: function () {
		const loc = fs.mkdtempSync(path.join("/tmp", nanoid(7)));
		const key = Buffer.alloc(32);
		sodium.randombytes_buf(key);
		return new encryptdown(new leveldown(loc), key);
	},
});
