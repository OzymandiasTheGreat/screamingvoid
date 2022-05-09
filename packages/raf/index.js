const path = require("path");
const util = require("util");
const { Buffer } = require("buffer");
const RandomAccess = require("random-access-storage");
const RNFS = require("react-native-fs");

module.exports = RandomAccessFile;

function RandomAccessFile(filename, options) {
	if (!(this instanceof RandomAccessFile))
		return new RandomAccessFile(filename, options);
	RandomAccess.call(this);

	if (!options) options = {};
	if (options.directory)
		filename = path.join(
			options.directory,
			path.resolve("/", filename).replace(/^\w+:\\/, ""),
		);

	this.filename = filename;

	this._size = options.size || options.length || 0;
	this._truncate = !!options.truncate || this._size > 0;
}

util.inherits(RandomAccessFile, RandomAccess);

RandomAccessFile.prototype._open = function (req) {
	RNFS.mkdir(path.dirname(this.filename))
		.then(() => RNFS.exists(this.filename))
		.then((exists) => {
			if (exists) {
				if (this._truncate) {
					return RNFS.read(
						this.filename,
						this._size,
						0,
						"base64",
					).then((data) =>
						RNFS.writeFile(this.filename, data, "base64"),
					);
				}
				return;
			}
			return RNFS.writeFile(this.filename, "");
		})
		.then(() => req.callback(null))
		.catch((err) => req.callback(err));
};

RandomAccessFile.prototype._openReadonly = function (req) {
	this._open(req);
};

RandomAccessFile.prototype._write = function (req) {
	RNFS.write(
		this.filename,
		Buffer.from(req.data).toString("base64"),
		req.offset,
		"base64",
	)
		.then(() => req.callback(null))
		.catch((err) => req.callback(err));
};

RandomAccessFile.prototype._read = function (req) {
	RNFS.read(this.filename, req.size, req.offset, "base64")
		.then((data) => {
			const buf = Buffer.from(data, "base64");
			req.callback(null, buf);
		})
		.catch((err) => req.callback(err));
};

RandomAccessFile.prototype._del = function (req) {
	RNFS.stat(this.filename)
		.then((stat) => {
			if (req.offset + req.size < stat.size) {
				return req.callback(null);
			}
			return RNFS.read(this.filename, req.offset, 0, "base64").then(
				(data) => {
					return RNFS.writeFile(this.filename, data, "base64");
				},
			);
		})
		.then(() => req.callback(null))
		.catch((err) => req.callback(err));
};

RandomAccessFile.prototype._stat = function (req) {
	RNFS.stat(this.filename)
		.then((stat) => req.callback(null, stat))
		.catch((err) => req.callback(err));
};

RandomAccessFile.prototype._close = function (req) {
	setImmediate(() => req.callback(null));
};

RandomAccessFile.prototype._destroy = function (req) {
	RNFS.unlink(this.filename)
		.then(() => req.callback(null))
		.catch((err) => req.callback(err));
};
