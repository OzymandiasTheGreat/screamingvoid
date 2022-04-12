import { Buffer } from "buffer";
import { basename, dirname, join } from "path";
import RNFS from "react-native-fs";
import { nanoid } from "nanoid/non-secure";
import { linux, parse } from "filesystem-constants";
import { Writable, Readable } from "readable-stream";
import type fs from "fs";
import errno from "./err";
import { Dir, Dirent, NotImplemented, Stats } from "./common";
import { closeFD, getFD, openFD } from "./fd";

const checkCallback = (callback?: Function) => {
	if (typeof callback !== "function") {
		throw new TypeError("Callback must be a function");
	}
};

export const constants = linux;

export const open: typeof fs.open = (
	path,
	flags?,
	mode?,
	callback?: (err: NodeJS.ErrnoException | null, fd: number) => void,
) => {
	if (typeof flags === "function") {
		return open(path, "r", 0o666, flags);
	}
	if (typeof mode === "function") {
		return open(path, flags, 0o666, mode);
	}
	if (typeof flags === "undefined" && callback) {
		return open(path, "r", mode, callback);
	}
	if (typeof mode === "undefined" && callback) {
		return open(path, flags, 0o666, callback);
	}
	checkCallback(callback);
	const fl = typeof flags === "number" ? flags : parse(linux, flags);
	openFD(path, fl)
		.then((fd) => callback?.(null, fd))
		.catch((err) => callback?.(err, -1));
};
open.__promisify__ = (path, flags?, mode?) =>
	new Promise((resolve, reject) =>
		open(path, flags, mode, (err, fd) => {
			if (err) {
				return reject(err);
			}
			resolve(fd);
		}),
	);

export const writeFile: typeof fs.writeFile = (
	path,
	data,
	options?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof options === "function") {
		return writeFile(path, data, { encoding: "utf8" }, options);
	}
	if (typeof options === "undefined" && callback) {
		return writeFile(path, data, { encoding: "utf8" }, callback);
	}
	checkCallback(callback);
	let out: Buffer;
	if (data instanceof Uint8Array) {
		out = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	} else {
		out = Buffer.from(
			data.toString(),
			(typeof options === "string"
				? options
				: options?.encoding) as BufferEncoding,
		);
	}
	if (typeof path === "number") {
		const fd = getFD(path);
		if (!fd?.writable) {
			return setImmediate(() => callback?.(errno.EBADF()));
		}
		RNFS.write(fd.path, out.toString("base64"), fd.position, "base64")
			.then(() => {
				fd.position += out.byteLength;
				callback?.(null);
			})
			.catch(callback);
	} else {
		RNFS.writeFile(path.toString(), out.toString("base64"), "base64")
			.then(() => callback?.(null))
			.catch(callback);
	}
};
writeFile.__promisify__ = (path, data, options) =>
	new Promise((resolve, reject) =>
		writeFile(path, data, options as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const appendFile: typeof fs.appendFile = (
	path,
	data,
	options?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof options === "function") {
		return appendFile(path, data, { encoding: "utf8" }, options);
	}
	if (typeof options === "undefined" && callback) {
		return appendFile(path, data, { encoding: "utf8" }, callback);
	}
	checkCallback(callback);
	let out: Buffer;
	if (data instanceof Uint8Array) {
		out = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	} else {
		out = Buffer.from(
			data.toString(),
			(typeof options === "string"
				? options
				: options?.encoding) as BufferEncoding,
		);
	}
	if (typeof path === "number") {
		const fd = getFD(path);
		if (!fd?.append) {
			return setImmediate(() => callback?.(errno.EBADF()));
		}
		RNFS.appendFile(fd.path, out.toString("base64"), "base64")
			.then(() => {
				fd.position += out.byteLength;
				callback?.(null);
			})
			.catch(callback);
	} else {
		RNFS.appendFile(path.toString(), out.toString("base64"), "base64")
			.then(() => callback?.(null))
			.catch(callback);
	}
};
appendFile.__promisify__ = (path, data, options) =>
	new Promise((resolve, reject) =>
		appendFile(path, data, options as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

type writeStrCallback = (
	err: NodeJS.ErrnoException | null,
	written: number,
	string: string,
) => void;
type writeBufCallback = (
	err: NodeJS.ErrnoException | null,
	bytesWritten: number,
	buffer: Uint8Array,
) => void;
function writeImpl(
	fd: number,
	buffer: Uint8Array,
	callback: writeBufCallback,
): void;
function writeImpl(
	fd: number,
	buffer: Uint8Array,
	position: number,
	callback: writeBufCallback,
): void;
function writeImpl(
	fd: number,
	buffer: Uint8Array,
	offset: number,
	length: number,
	callback: writeBufCallback,
): void;
function writeImpl(
	fd: number,
	buffer: Uint8Array,
	offset: number,
	length: number,
	position: number,
	callback: writeBufCallback,
): void;
function writeImpl(
	fd: number,
	string: string,
	callback: writeStrCallback,
): void;
function writeImpl(
	fd: number,
	string: string,
	position: number,
	callback: writeStrCallback,
): void;
function writeImpl(
	fd: number,
	string: string,
	position: number,
	encoding: BufferEncoding,
	callback: writeStrCallback,
): void;
function writeImpl(
	fd: number,
	data: Uint8Array | string,
	offsetOrPos?:
		| number
		| BufferEncoding
		| writeBufCallback
		| writeStrCallback,
	lengthOrEnc?:
		| number
		| BufferEncoding
		| writeBufCallback
		| writeStrCallback,
	posOrCB?: number | writeBufCallback | writeStrCallback,
	callback?: writeBufCallback | writeStrCallback,
): void {
	const descriptor = getFD(fd);
	if (data instanceof Uint8Array) {
		if (typeof offsetOrPos === "function") {
			return writeImpl(
				fd,
				data,
				data.byteOffset,
				data.byteLength,
				descriptor?.position || 0,
				offsetOrPos as writeBufCallback,
			);
		}
		if (typeof lengthOrEnc === "function") {
			return writeImpl(
				fd,
				data,
				data.byteOffset,
				data.byteLength,
				offsetOrPos as number,
				lengthOrEnc as writeBufCallback,
			);
		}
		if (typeof posOrCB === "function") {
			return writeImpl(
				fd,
				data,
				offsetOrPos as number,
				lengthOrEnc as number,
				descriptor?.position || 0,
				posOrCB as writeBufCallback,
			);
		}
		if (typeof offsetOrPos === "undefined") {
			return writeImpl(
				fd,
				data,
				data.byteOffset || (descriptor?.position as number),
				lengthOrEnc as number,
				posOrCB as number,
				callback as writeBufCallback,
			);
		}
		if (typeof lengthOrEnc === "undefined") {
			return writeImpl(
				fd,
				data,
				data.byteOffset,
				data.byteLength,
				offsetOrPos as number,
				callback as writeBufCallback,
			);
		}
		if (typeof posOrCB === "undefined") {
			return writeImpl(
				fd,
				data,
				offsetOrPos as number,
				lengthOrEnc as number,
				descriptor?.position || 0,
				callback as writeBufCallback,
			);
		}
	}
	if (typeof data === "string") {
		if (typeof offsetOrPos === "function") {
			return writeImpl(
				fd,
				data,
				descriptor?.position || 0,
				"utf8",
				offsetOrPos as writeStrCallback,
			);
		}
		if (typeof offsetOrPos === "string") {
			return writeImpl(
				fd,
				data,
				descriptor?.position || 0,
				offsetOrPos,
				lengthOrEnc as writeStrCallback,
			);
		}
		if (typeof lengthOrEnc === "function") {
			return writeImpl(
				fd,
				data,
				offsetOrPos as number,
				"utf8",
				lengthOrEnc as writeStrCallback,
			);
		}
		if (typeof callback === "function") {
			if (typeof lengthOrEnc === "string") {
				data = Buffer.from(data, lengthOrEnc);
				return writeImpl(
					fd,
					data,
					0,
					data.length,
					offsetOrPos as number,
					callback as writeBufCallback,
				);
			}
			return writeImpl(
				fd,
				Buffer.from(data),
				offsetOrPos as number,
				lengthOrEnc as number,
				posOrCB as number,
				callback as writeBufCallback,
			);
		}
		if (typeof offsetOrPos === "undefined") {
			return writeImpl(
				fd,
				data,
				descriptor?.position || 0,
				lengthOrEnc as any,
				posOrCB as writeStrCallback,
			);
		}
		if (typeof lengthOrEnc === "undefined") {
			return writeImpl(
				fd,
				data,
				offsetOrPos,
				"utf8",
				posOrCB as writeStrCallback,
			);
		}
	}
	if (typeof data === "string") {
		if (!descriptor?.writable) {
			setImmediate(() => (posOrCB as any)(errno.EBADF()));
			return;
		}
		const out = Buffer.from(data, lengthOrEnc as BufferEncoding);
		if (descriptor.append) {
			RNFS.appendFile(descriptor.path, out.toString("base64"), "base64")
				.then(() => {
					descriptor.position += out.byteLength;
					(posOrCB as writeStrCallback)(
						null,
						out.byteLength,
						out.toString(),
					);
				})
				.catch(posOrCB as any);
			return;
		}
		RNFS.write(
			descriptor.path,
			out.toString("base64"),
			offsetOrPos as number,
			"base64",
		)
			.then(() => {
				descriptor.position += out.byteLength;
				(posOrCB as writeStrCallback)(
					null,
					out.byteLength,
					out.toString(),
				);
			})
			.catch(posOrCB as any);
		return;
	}
	if (!descriptor?.writable) {
		setImmediate(() => (callback as any)(errno.EBADF()));
		return;
	}
	const out = Buffer.from(
		data.buffer,
		offsetOrPos as number,
		lengthOrEnc as number,
	);
	if (descriptor.append) {
		RNFS.appendFile(descriptor.path, out.toString("base64"), "base64")
			.then(() => {
				descriptor.position += out.byteLength;
				callback?.(null, out.byteLength, out as any);
			})
			.catch(callback as any);
		return;
	}
	RNFS.write(
		descriptor.path,
		out.toString("base64"),
		posOrCB as number,
		"base64",
	)
		.then(() => {
			descriptor.position += out.byteLength;
			callback?.(null, out.byteLength, out as any);
		})
		.catch(callback as any);
}
writeImpl.__promisify__ = (
	fd: number,
	data: Uint8Array,
	offsetOrPos: number,
	lengthOrEnc: number,
	pos: number,
): Promise<{ bytesWritten: number; buffer: any }> => {
	return new Promise((resolve, reject) =>
		writeImpl(
			fd,
			data,
			offsetOrPos,
			lengthOrEnc,
			pos,
			(err, bytesWritten, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve({ bytesWritten, buffer });
			},
		),
	);
};
export const write: typeof fs.write = writeImpl as any;

export const writev: typeof fs.writev = (
	fd,
	buffers,
	position?,
	callback?: (
		err: NodeJS.ErrnoException | null,
		bytesWritten: number,
		buffers: NodeJS.ArrayBufferView[],
	) => void,
) => {
	const descriptor = getFD(fd);
	if (typeof position === "function") {
		return writev(fd, buffers, descriptor?.position || 0, position);
	}
	if (typeof position !== "number") {
		return writev(fd, buffers, descriptor?.position || 0, callback as any);
	}
	checkCallback(callback);
	if (!descriptor?.writable) {
		return setImmediate(() => (callback as any)?.(errno.EBADF()));
	}
	if (descriptor.append) {
		(async () => {
			let err;
			let bytesWritten = 0;
			const bufs = [];
			for (let buf of buffers) {
				const data = Buffer.from(
					buf.buffer,
					buf.byteOffset,
					buf.byteLength,
				);
				try {
					await RNFS.appendFile(
						descriptor.path,
						data.toString("base64"),
						"base64",
					);
				} catch (e) {
					err = e;
					break;
				}
				bufs.push(data);
				bytesWritten += data.byteLength;
				descriptor.position += data.byteLength;
			}
			if (err) {
				(callback as any)?.(err);
			} else {
				callback?.(null, bytesWritten, bufs);
			}
		})();
		return;
	}
	(async () => {
		let err;
		let bytesWritten = 0;
		const bufs = [];
		for (let buf of buffers) {
			const data = Buffer.from(
				buf.buffer,
				buf.byteOffset,
				buf.byteLength,
			);
			try {
				await RNFS.write(
					descriptor.path,
					data.toString("base64"),
					position,
					"base64",
				);
			} catch (e) {
				err = e;
				break;
			}
			position += data.byteLength;
			bufs.push(data);
			bytesWritten += data.byteLength;
			descriptor.position = position;
		}
		if (err) {
			(callback as any)?.(err);
		} else {
			callback?.(null, bytesWritten, bufs);
		}
	})();
	return;
};
writev.__promisify__ = (fd, buffers, position) =>
	new Promise((resolve, reject) =>
		writev(fd, buffers, position as any, (err, bytesWritten, buffers) => {
			if (err) {
				return reject(err);
			}
			resolve({ bytesWritten, buffers });
		}),
	);

type WriteStreamOptions = {
	append: boolean;
	encoding: BufferEncoding;
	path: string;
	autoClose: boolean;
	emitClose: boolean;
	position: number;
};
export const createWriteStream: typeof fs.createWriteStream = (
	path,
	options?,
): Writable & {
	close: () => void;
	bytesWritten: number;
	path: string;
	pending: boolean;
} => {
	const fd =
		typeof options === "object"
			? options.fd
				? (options.fd as number)
				: null
			: null;
	const descriptor = fd ? getFD(fd) : undefined;
	const file = descriptor ? descriptor.path : path.toString();
	const flags =
		typeof options === "object"
			? parse(linux, options.flags || "w")
			: parse(linux, "w");
	const opts: WriteStreamOptions = {
		path: file,
		append: descriptor
			? descriptor.append
			: (flags & linux.O_APPEND) === linux.O_APPEND,
		encoding:
			typeof options === "string"
				? options
				: options?.encoding || "utf8",
		autoClose:
			typeof options === "object" ? options.autoClose || true : true,
		emitClose:
			typeof options === "object" ? options.emitClose || true : true,
		position:
			typeof options === "object"
				? options.start || (descriptor ? descriptor.position : 0)
				: 0,
	};
	let bytesWritten = 0;
	const stream: Writable & {
		close: () => void;
		bytesWritten: number;
		path: string;
		pending: boolean;
	} = new Writable({
		defaultEncoding: opts.encoding,
		emitClose: opts.emitClose,
		final: (callback) => {
			if (opts.autoClose) {
				try {
					fd && closeFD(fd);
				} catch (err) {
					return callback(err as any);
				}
			}
			callback();
		},
		write: (chunk, encoding, callback) => {
			let data: Buffer;
			if (typeof chunk === "string") {
				data = Buffer.from(chunk, encoding);
			} else if (chunk instanceof Uint8Array) {
				data = Buffer.from(
					chunk.buffer,
					chunk.byteOffset,
					chunk.byteLength,
				);
			} else {
				data = Buffer.from(chunk);
			}
			if (opts.append) {
				RNFS.appendFile(opts.path, data?.toString("base64"), "base64")
					.then(() => {
						bytesWritten += data.byteLength;
						callback();
					})
					.catch((err) => stream.destroy(err));
			} else {
				RNFS.write(
					opts.path,
					data?.toString("base64"),
					opts.position,
					"base64",
				)
					.then(() => {
						bytesWritten += data.byteLength;
						opts.position += data.byteLength;
						callback();
					})
					.catch((err) => stream.destroy(err));
			}
		},
	}) as any;
	stream.close = () => {
		try {
			fd && closeFD(fd);
		} catch (err) {
			stream.destroy(err as any);
		}
	};
	stream.bytesWritten = bytesWritten;
	stream.path = opts.path;
	stream.pending = false;
	if (descriptor && !descriptor.writable) {
		stream.destroy(errno.EBADF());
	}
	return stream;
};

type ReadStreamOptions = {
	path: string;
	encoding?: BufferEncoding;
	autoClose: boolean;
	emitClose: boolean;
	position: number;
	end: number;
};
export const createReadStream: typeof fs.createReadStream = (
	path,
	options?,
): Readable & {
	close: () => void;
	bytesRead: number;
	path: string;
	pending: boolean;
} => {
	const fd =
		typeof options === "object"
			? options.fd
				? (options.fd as number)
				: null
			: null;
	const descriptor = fd ? getFD(fd) : undefined;
	const file = descriptor ? descriptor.path : path.toString();
	const opts: ReadStreamOptions = {
		path: file,
		encoding:
			typeof options === "string"
				? options
				: options?.encoding || undefined,
		autoClose:
			typeof options === "object" ? options.autoClose || true : true,
		emitClose:
			typeof options === "object" ? options.emitClose || true : true,
		position:
			typeof options === "object"
				? options.start || (descriptor ? descriptor.position : 0)
				: 0,
		end: typeof options === "object" ? options.end || -1 : -1,
	};
	let bytesRead = 0;
	const stream: Readable & {
		close: () => void;
		bytesRead: number;
		path: string;
		pending: boolean;
	} = new Readable({
		emitClose: opts.emitClose,
		encoding: opts.encoding,
		highWaterMark: 64 * 1024,
		read: (size) => {
			RNFS.read(opts.path, size, opts.position, "base64")
				.then((val) => {
					const buffer = Buffer.from(val, "base64");
					if (
						opts.end >= 0 &&
						opts.position + buffer.byteLength > opts.end
					) {
						stream.push(buffer.slice(0, opts.end - opts.position));
						stream.push(null);
					} else {
						stream.push(buffer);
						if (!buffer.length) {
							stream.push(null);
						}
					}
					opts.position += buffer.byteLength;
					bytesRead += buffer.byteLength;
				})
				.catch((err) => stream.destroy(err));
		},
		destroy: (err, callback) => {
			if (opts.autoClose) {
				try {
					fd && closeFD(fd);
				} catch (err2) {
					return callback(err2 as any);
				}
			}
			callback(err);
		},
	}) as any;
	stream.close = () => {
		try {
			fd && closeFD(fd);
		} catch (err) {
			stream.destroy(err as any);
		}
	};
	stream.bytesRead = bytesRead;
	stream.path = opts.path;
	stream.pending = false;
	if (descriptor && !descriptor.readable) {
		stream.destroy(errno.EBADF());
	}
	return stream;
};

export const read: typeof fs.read = ((
	fd: number,
	buffer:
		| Uint8Array
		| fs.ReadAsyncOptions<Uint8Array>
		| ((
				err: NodeJS.ErrnoException | null,
				bytesRead: number,
				buffer: Uint8Array,
		  ) => void),
	offset:
		| number
		| ((
				err: NodeJS.ErrnoException | null,
				bytesRead: number,
				buffer: Uint8Array,
		  ) => void),
	length?: number,
	position?: number | null,
	callback?: (
		err: NodeJS.ErrnoException | null,
		bytesRead: number,
		buffer: Uint8Array,
	) => void,
) => {
	if (typeof buffer === "function") {
		return read(fd, Buffer.alloc(16 * 1024), 0, 16 * 1024, null, buffer);
	}
	if (!(buffer instanceof Uint8Array) && typeof offset === "function") {
		return read(
			fd,
			(buffer as any).buffer || Buffer.alloc(16 * 1024),
			(buffer as any).offset || 0,
			(buffer as any).length || buffer.buffer?.byteLength || 16 * 1024,
			(buffer as any).position || null,
			offset,
		);
	}
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor?.readable) {
		return setImmediate(() => (callback as any)?.(errno.EBADF()));
	}
	RNFS.read(
		descriptor.path,
		length,
		typeof position === "number" ? position : descriptor.position,
		"base64",
	)
		.then((data) => {
			const buf = Buffer.from(data, "base64");
			buf.copy(buffer as Uint8Array, offset as number, 0, length);
			if (!position) {
				descriptor.position += buf.byteLength;
			}
			callback?.(null, buf.byteLength, buffer as Uint8Array);
		})
		.catch(callback as any);
}) as any;
read.__promisify__ = ((
	fd: number,
	buffer?:
		| NodeJS.ArrayBufferView
		| fs.ReadAsyncOptions<NodeJS.ArrayBufferView>,
	offset?: number,
	length?: number,
	position?: number | null,
) =>
	new Promise((resolve, reject) => {
		if (typeof buffer === "undefined") {
			return read(fd, (err, bytesRead, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve({ bytesRead, buffer });
			});
		}
		if (buffer && typeof offset === "undefined") {
			return read(
				fd,
				buffer as fs.ReadAsyncOptions<NodeJS.ArrayBufferView>,
				(err, bytesRead, buffer) => {
					if (err) {
						return reject(err);
					}
					resolve({ bytesRead, buffer });
				},
			);
		}
		read(
			fd,
			buffer as any,
			offset as any,
			length as any,
			position as any,
			(err, bytesRead, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve({ bytesRead, buffer });
			},
		);
	})) as any;

export const readv: typeof fs.readv = (
	fd,
	buffers,
	position,
	callback?: (
		err: NodeJS.ErrnoException | null,
		bytesRead: number,
		buffers: NodeJS.ArrayBufferView[],
	) => void,
) => {
	if (typeof position === "function") {
		return readv(fd, buffers, null as any, position);
	}
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor?.readable) {
		return setImmediate(() => (callback as any)(errno.EBADF()));
	}
	let current =
		typeof position === "number" ? position : descriptor.position;
	let bytesRead = 0;
	(async () => {
		let err;
		for (let buffer of buffers) {
			try {
				const buf = Buffer.from(
					await RNFS.read(
						descriptor.path,
						buffer.byteLength,
						current,
						"base64",
					),
					"base64",
				);
				if (!buf.byteLength) {
					break;
				}
				buf.copy(buffer as any);
				current += buf.byteLength;
				bytesRead += buf.byteLength;
				if (typeof position !== "number") {
					descriptor.position += buf.byteLength;
				}
			} catch (e) {
				err = e;
				break;
			}
		}
		if (err) {
			(callback as any)(err);
		} else {
			callback?.(null, bytesRead, buffers as any);
		}
	})();
};
readv.__promisify__ = (fd, buffers, position?) =>
	new Promise((resolve, reject) =>
		readv(fd, buffers, position as any, (err, bytesRead, buffers) => {
			if (err) {
				return reject(err);
			}
			resolve({ bytesRead, buffers });
		}),
	);

export const readFile: typeof fs.readFile = ((
	path: fs.PathLike,
	options: string | { encoding: BufferEncoding | null },
	callback?: (
		err: NodeJS.ErrnoException | null,
		data: Buffer | string,
	) => void,
) => {
	if (typeof options === "function") {
		return readFile(path, { encoding: null }, options);
	}
	if (typeof options === "string") {
		return readFile(
			path,
			{ encoding: options as BufferEncoding },
			callback as any,
		);
	}
	if (typeof options === "undefined") {
		return readFile(path, { encoding: null }, callback as any);
	}
	checkCallback(callback);
	if (typeof path === "number") {
		const fd = getFD(path);
		if (!fd?.readable) {
			return setImmediate(() => (callback as any)(errno.EBADF()));
		}
		RNFS.read(fd.path, fd.size, fd.position, "base64")
			.then((data) => {
				const buf = Buffer.from(data, "base64");
				fd.position += buf.byteLength;
				callback?.(
					null,
					options?.encoding ? buf.toString(options.encoding) : buf,
				);
			})
			.catch(callback as any);
		return;
	}
	RNFS.readFile(path.toString(), "base64")
		.then((data) => {
			const buf = Buffer.from(data, "base64");
			callback?.(
				null,
				options.encoding ? buf.toString(options.encoding) : buf,
			);
		})
		.catch(callback as any);
}) as any;
readFile.__promisify__ = (path, options) =>
	new Promise((resolve, reject) =>
		readFile(path, options, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		}),
	) as any;

export const close: typeof fs.close = (fd, callback) => {
	try {
		closeFD(fd);
	} catch (err) {
		return callback?.(err as any);
	}
	callback?.(null);
};
close.__promisify__ = (fd) =>
	new Promise((resolve, reject) =>
		close(fd, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const copyFile: typeof fs.copyFile = (src, dest, mode?, callback?) => {
	if (typeof mode === "function") {
		return copyFile(src, dest, 0, mode);
	}
	checkCallback(callback as any);
	const exclusive = (mode & linux.COPYFILE_EXCL) === linux.COPYFILE_EXCL;
	RNFS.stat(dest.toString())
		.then((stat) => {
			if (stat.isDirectory()) {
				throw errno.EISDIR(dest.toString());
			}
			if (exclusive) {
				throw errno.EEXIST(dest.toString());
			}
			return RNFS.copyFile(src.toString(), dest.toString());
		})
		.catch((err) => {
			if (err.message === "File does not exist") {
				return RNFS.copyFile(src.toString(), dest.toString());
			}
			if (err.code === "EUNSPECIFIED") {
				throw errno.EISDIR(src.toString());
			}
			throw err;
		})
		.then(() => (callback as any)(null))
		.catch(callback as any);
};
copyFile.__promisify__ = (src, dest, mode) =>
	new Promise((resolve, reject) =>
		copyFile(src, dest, mode as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const cp: typeof fs.cp = (
	src,
	dest,
	options?,
	callback?: (err: NodeJS.ErrnoException | null) => void,
) => {
	if (typeof options === "function") {
		return cp(src, dest, {}, options);
	}
	checkCallback(callback);
	const opts = Object.assign(
		{
			errorOnExist: false,
			force: true,
			recursive: false,
		},
		options,
	);
	const copy = async (src: string, dest: string): Promise<void> => {
		const sstat = await RNFS.stat(src).catch(() => null);
		const dstat = await RNFS.stat(dest).catch(() => null);
		if (!sstat) {
			return callback?.(errno.ENOENT(src));
		}
		if (opts.errorOnExist && dstat) {
			return callback?.(errno.EEXIST(dest));
		}
		if (!opts.force && dstat) {
			return;
		}
		if (sstat.isDirectory()) {
			try {
				await RNFS.mkdir(join(dest, basename(src)));
			} catch (err) {
				return callback?.(err as any);
			}
			if (!opts.recursive) {
				return;
			}
			return RNFS.readDir(src).then((items) =>
				Promise.all(
					items.map((i) => copy(i.path, join(dest, i.name))),
				).then(),
			);
		}
		try {
			return RNFS.copyFile(src, dest);
		} catch (err) {
			return callback?.(err as any);
		}
	};
	(async () => {
		const sstat = await RNFS.stat(src).catch(() => null);
		const dstat = await RNFS.stat(dest).catch(() => null);
		if (!sstat) {
			return callback?.(errno.ENOENT(src));
		}
		if (opts.errorOnExist && dstat) {
			return callback?.(errno.EEXIST(dest));
		}
		if (!opts.force && dstat) {
			return;
		}
		if (sstat.isDirectory()) {
			try {
				await RNFS.mkdir(dest);
			} catch (err) {
				return callback?.(err as any);
			}
			return RNFS.readDir(src)
				.then((items) =>
					Promise.all(
						items.map((i) => copy(i.path, join(dest, i.name))),
					),
				)
				.then(() => callback?.(null))
				.catch((err) => callback?.(err));
		}
		RNFS.copyFile(src, dest)
			.then(() => callback?.(null))
			.catch(callback);
	})();
};

export const mkdir: typeof fs.mkdir = (
	path,
	options?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof options === "function") {
		return mkdir(path, {}, options);
	}
	checkCallback(callback);
	const opts = Object.assign({ recursive: false }, options);
	if (opts.recursive) {
		RNFS.mkdir(path.toString())
			.then(() => callback?.(null))
			.catch(callback);
	} else {
		(async () => {
			let exists = await RNFS.exists(path.toString());
			if (exists) {
				return callback?.(errno.EEXIST(path.toString()));
			}
			exists = await RNFS.exists(dirname(path.toString()));
			if (!exists) {
				return callback?.(errno.ENOENT(path.toString()));
			}
			await RNFS.mkdir(path.toString())
				.then(() => callback?.(null))
				.catch(callback);
		})();
	}
};
mkdir.__promisify__ = ((
	path: fs.PathLike,
	options?: fs.MakeDirectoryOptions,
): Promise<string | undefined> =>
	new Promise((resolve, reject) =>
		mkdir(path, options, (err, path) => {
			if (err) {
				return reject(err);
			}
			resolve(path);
		}),
	)) as any;

export const mkdtemp: typeof fs.mkdtemp = (
	prefix,
	options?,
	callback?: (err: NodeJS.ErrnoException | null, dir: any) => void,
) => {
	if (typeof options === "function") {
		return mkdtemp(prefix, { encoding: "utf8" }, options);
	}
	if (typeof options === "string") {
		return mkdtemp(prefix, { encoding: options as any }, callback as any);
	}
	if (typeof options === "undefined") {
		return mkdtemp(prefix, { encoding: "utf8" }, callback as any);
	}
	checkCallback(callback);
	const dir = join(
		RNFS.TemporaryDirectoryPath,
		(options?.encoding
			? options.encoding === "buffer"
				? Buffer.from(prefix).toString()
				: Buffer.from(prefix, options.encoding)
			: prefix) + nanoid(6),
	);
	RNFS.mkdir(dir)
		.then(() => callback?.(null, dir))
		.catch(callback as any);
};
mkdtemp.__promisify__ = ((prefix: string, options: fs.EncodingOption) =>
	new Promise((resolve, reject) =>
		mkdtemp(prefix, options, (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		}),
	)) as any;

export const opendir: typeof fs.opendir = (
	path,
	options?,
	callback?: (err: NodeJS.ErrnoException | null, dir: Dir) => void,
) => {
	if (typeof options === "function") {
		return opendir(path, { encoding: "utf8" }, options);
	}
	if (typeof options === "string") {
		return opendir(path, { encoding: options }, callback as any);
	}
	if (typeof options === "undefined") {
		return opendir(path, { encoding: "utf8" }, callback as any);
	}
	checkCallback(callback);
	setImmediate(() => callback?.(null, new Dir(path, options.encoding)));
};
opendir.__promisify__ = (path, options) =>
	new Promise((resolve, reject) =>
		opendir(path, options as any, (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		}),
	);

type readdirOptions =
	| {
			encoding?: BufferEncoding | "buffer";
			withFileTypes?: boolean;
	  }
	| undefined
	| null
	| BufferEncoding;
type readdirCallback = (
	err: NodeJS.ErrnoException | null,
	files: string[] | Buffer[] | Dirent[],
) => void;
function readdirImpl(
	path: fs.PathLike,
	options: readdirOptions,
	callback: readdirCallback,
): void;
function readdirImpl(path: fs.PathLike, callback: readdirCallback): void;
function readdirImpl(
	path: fs.PathLike,
	options?: readdirOptions | readdirCallback,
	callback?: readdirCallback,
): void {
	if (typeof options === "function") {
		return readdirImpl(path, { encoding: "utf8" }, options);
	}
	if (typeof options === "string") {
		return readdirImpl(path, { encoding: options }, callback as any);
	}
	if (typeof options === "undefined") {
		return readdirImpl(path, { encoding: "utf8" }, callback as any);
	}
	checkCallback(callback);
	const dir =
		options?.encoding === "buffer"
			? path.toString()
			: Buffer.from(
					path.toString(),
					options?.encoding || "utf8",
			  ).toString();
	if (options?.withFileTypes) {
		RNFS.readDir(dir)
			.then((items) =>
				callback?.(
					null,
					items.map((i) => new Dirent(i)),
				),
			)
			.catch(callback as any);
		return;
	}
	RNFS.readdir(dir)
		.then((items) => {
			if (options?.encoding === "buffer") {
				callback?.(
					null,
					items.map((i) => Buffer.from(i)),
				);
			} else {
				callback?.(null, items);
			}
		})
		.catch(callback as any);
}
readdirImpl.__promisify__ = ((
	path: fs.PathLike,
	options: readdirOptions,
): Promise<string[] | Buffer[] | Dirent[]> =>
	new Promise((resolve, reject) =>
		readdirImpl(path, options as any, (err, files) => {
			if (err) {
				return reject(err);
			}
			resolve(files);
		}),
	)) as any;
export const readdir: typeof fs.readdir = readdirImpl as any;

export const rmdir: typeof fs.rmdir = (
	path,
	options?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof options === "function") {
		return rmdir(path, {}, options);
	}
	if (typeof options === "undefined") {
		return rmdir(path, {}, callback as any);
	}
	checkCallback(callback);
	RNFS.readdir(path.toString())
		.then((items) => {
			if (!items.length || options.recursive) {
				return RNFS.unlink(path.toString())
					.then(() => callback?.(null))
					.catch(callback);
			}
			throw errno.ENOTEMPTY(path.toString());
		})
		.catch((err) => {
			if (err.message === "Attempt to get length of null array") {
				return callback?.(errno.ENOTDIR(path.toString()));
			}
			if (err.message === "Folder does not exist") {
				return callback?.(errno.ENOENT(path.toString()));
			}
			callback?.(err);
		});
};
rmdir.__promisify__ = (path, options) =>
	new Promise((resolve, reject) =>
		rmdir(path, options as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const unlink: typeof fs.unlink = (path, callback) => {
	checkCallback(callback);
	RNFS.stat(path.toString())
		.then((stat) => {
			if (stat.isDirectory()) {
				return callback(errno.EISDIR(path.toString()));
			}
			return RNFS.unlink(path.toString()).then(() => callback(null));
		})
		.catch((err) => {
			if (err.message === "File does not exist") {
				return callback(errno.ENOENT(path.toString()));
			}
			callback(err);
		});
};
unlink.__promisify__ = (path) =>
	new Promise((resolve, reject) =>
		unlink(path, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const rm: typeof fs.rm = (
	path,
	options?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof options === "function") {
		return rm(path, {}, options);
	}
	checkCallback(callback);
	(async () => {
		const stat = await RNFS.stat(path.toString()).catch((err) => err);
		if (stat instanceof Error) {
			if (stat.message === "File does not exist" && options?.force) {
				return callback?.(null);
			}
			return callback?.(errno.ENOENT(path.toString()));
		}
		if (stat.isDirectory()) {
			const items = await RNFS.readdir(path.toString()).catch();
			if (items?.length) {
				if (options?.recursive) {
					return RNFS.unlink(path.toString())
						.then(() => callback?.(null))
						.catch(callback);
				}
				return callback?.(errno.ENOTEMPTY(path.toString()));
			}
		}
		return RNFS.unlink(path.toString())
			.then(() => callback?.(null))
			.catch(callback);
	})();
};
rm.__promisify__ = (path, options) =>
	new Promise((resolve, reject) =>
		rm(path, options as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const truncate: typeof fs.truncate = (
	path,
	len?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof len === "function") {
		return truncate(path, 0, len);
	}
	checkCallback(callback);
	if (typeof path === "number") {
		const descriptor = getFD(path);
		if (!descriptor) {
			return setImmediate(() => callback?.(errno.EBADF()));
		}
		path = descriptor.path;
	}
	if (len) {
		(async () => {
			const data =
				(await RNFS.read(path.toString(), len, 0, "base64")) ||
				Buffer.alloc(len).toString("base64");
			return RNFS.writeFile(path.toString(), data, "base64")
				.then(() => callback?.(null))
				.catch(callback);
		})();
		return;
	}
	RNFS.writeFile(path.toString(), "")
		.then(() => callback?.(null))
		.catch(callback);
};
truncate.__promisify__ = (path, len) =>
	new Promise((resolve, reject) =>
		truncate(path, len, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const stat: typeof fs.stat = (
	path,
	options?,
	callback?: (err: NodeJS.ErrnoException | null, stats: any) => void,
) => {
	if (typeof options === "function") {
		return stat(path, {}, options);
	}
	checkCallback(callback);
	RNFS.stat(path.toString())
		.then((stats) => callback?.(null, new Stats(stats)))
		.catch((err) => {
			if (err.message === "File does not exist") {
				return (callback as any)?.(errno.ENOENT(path.toString()));
			}
			return (callback as any)?.(err);
		});
};
stat.__promisify__ = ((path: fs.PathLike, options: any) =>
	new Promise((resolve, reject) =>
		stat(path, options, (err, stats) => {
			if (err) {
				return reject(err);
			}
			resolve(stats);
		}),
	)) as any;

export const utimes: typeof fs.utimes = (path, atime, mtime, callback) => {
	let time: Date;
	if (mtime instanceof Date) {
		time = mtime;
	} else if (typeof mtime === "number") {
		time = new Date(mtime);
	} else if (typeof mtime === "string") {
		time = new Date(parseInt(mtime));
	} else {
		throw new Error("InvalidArgument");
	}
	checkCallback(callback);
	RNFS.touch(path.toString(), time)
		.then(() => callback?.(null))
		.catch(callback);
};
utimes.__promisify__ = (path, atime, mtime) =>
	new Promise((resolve, reject) =>
		utimes(path, atime, mtime, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const access: typeof fs.access = (
	path,
	mode?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof mode === "function") {
		return access(path, linux.F_OK, mode);
	}
	checkCallback(callback);
	RNFS.exists(path.toString())
		.then((e) => {
			if (!e) {
				return callback?.(errno.ENOENT(path.toString()));
			}
			return callback?.(null);
		})
		.catch(callback);
};
access.__promisify__ = (path, mode) =>
	new Promise((resolve, reject) =>
		access(path, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const chmod: typeof fs.chmod = (path, mode, callback) => {
	checkCallback(callback);
	RNFS.exists(path.toString())
		.then((e) => {
			if (!e) {
				return callback(errno.ENOENT(path.toString()));
			}
			return callback(null);
		})
		.catch(callback);
};
chmod.__promisify__ = (path, mode) =>
	new Promise((resolve, reject) =>
		chmod(path, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const chown: typeof fs.chown = (path, uid, gid, callback) => {
	checkCallback(callback);
	RNFS.exists(path.toString())
		.then((e) => {
			if (!e) {
				return callback(errno.ENOENT(path.toString()));
			}
			return callback(null);
		})
		.catch(callback);
};
chown.__promisify__ = (path, uid, gid) =>
	new Promise((resolve, reject) =>
		chown(path, uid, gid, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const exists: typeof fs.exists = (path, callback) => {
	checkCallback(callback);
	RNFS.exists(path.toString())
		.then(callback)
		.catch(() => callback(false));
};
exists.__promisify__ = (path) =>
	new Promise((resolve) => exists(path, resolve));

export const link: typeof fs.link = (existingPath, newPath, callback) => {
	checkCallback(callback);
	setImmediate(() => callback(NotImplemented));
};
link.__promisify__ = (existingPath, newPath) =>
	new Promise((resolve, reject) =>
		link(existingPath, newPath, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const readlink: typeof fs.readlink = (
	path,
	options?,
	callback?: any,
) => {
	if (typeof options === "function") {
		return readlink(path, {}, options);
	}
	checkCallback(callback);
	setImmediate(() => callback(NotImplemented));
};
readlink.__promisify__ = ((path: string, options: any) =>
	new Promise((resolve, reject) =>
		readlink(path, options, (err, link) => {
			if (err) {
				return reject(err);
			}
			resolve(link);
		}),
	)) as any;

export const realpath: typeof fs.realpath = (
	path,
	options?,
	callback?: (err: NodeJS.ErrnoException | null, realpath: any) => void,
) => {
	if (typeof options === "function") {
		return realpath(path, {}, options);
	}
	checkCallback(callback);
	const buffer =
		typeof options === "string"
			? options === "buffer"
			: options?.encoding === "buffer";
	RNFS.stat(path.toString())
		.then((stat) =>
			callback?.(
				null,
				buffer
					? Buffer.from(stat.originalFilepath)
					: stat.originalFilepath,
			),
		)
		.catch((err) => {
			if (err.message === "File does not exist") {
				return (callback as any)?.(errno.ENOENT(path.toString()));
			}
			return (callback as any)?.(err);
		});
};
realpath.__promisify__ = ((path: string, options: any) =>
	new Promise((resolve, reject) =>
		realpath(path, options, (err, path) => {
			if (err) {
				return reject(err);
			}
			resolve(path);
		}),
	)) as any;
realpath.native = realpath;

export const rename: typeof fs.rename = (oldPath, newPath, callback) => {
	checkCallback(callback);
	RNFS.stat(newPath.toString())
		.catch(() => {})
		.then((stat) => {
			if (stat?.isDirectory()) {
				throw errno.EISDIR(newPath.toString());
			}
			return RNFS.moveFile(oldPath.toString(), newPath.toString());
		})
		.then(() => callback(null))
		.catch((err) => {
			callback(err);
		});
};
rename.__promisify__ = (oldPath, newPath) =>
	new Promise((resolve, reject) =>
		rename(oldPath, newPath, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const symlink: typeof fs.symlink = (
	target,
	path,
	type?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof type === "function") {
		return symlink(target, path, undefined, type);
	}
	checkCallback(callback);
	setImmediate(() => callback?.(NotImplemented));
};
symlink.__promisify__ = (target, path, type) =>
	new Promise((resolve, reject) =>
		symlink(target, path, type as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const watch: typeof fs.watch = () => {
	throw NotImplemented;
};

export const watchFile: typeof fs.watchFile = () => {
	throw NotImplemented;
};

export const unwatchFile: typeof fs.unwatchFile = () => {
	throw NotImplemented;
};

export const fchmod: typeof fs.fchmod = (fd, mode, callback) => {
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback(errno.EBADF()));
	}
	return chmod(descriptor.path, mode, callback);
};
fchmod.__promisify__ = (fd, mode) =>
	new Promise((resolve, reject) =>
		fchmod(fd, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const fchown: typeof fs.fchown = (fd, uid, gid, callback) => {
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback(errno.EBADF()));
	}
	return chown(descriptor.path, uid, gid, callback);
};
fchown.__promisify__ = (fd, uid, gid) =>
	new Promise((resolve, reject) =>
		fchown(fd, uid, gid, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const fdatasync: typeof fs.fdatasync = (fd, callback) => {
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback(errno.EBADF()));
	}
	setImmediate(() => callback(null));
};
fdatasync.__promisify__ = () => Promise.resolve();

export const fsync: typeof fs.fsync = (fd, callback) => {
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback(errno.EBADF()));
	}
	setImmediate(() => callback(null));
};
fsync.__promisify__ = () => Promise.resolve();

export const fstat: typeof fs.fstat = (fd, options?, callback?: any) => {
	if (typeof options === "function") {
		return fstat(fd, {}, options);
	}
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback?.(errno.EBADF()));
	}
	return stat(descriptor.path, options, callback);
};
fstat.__promisify__ = ((fd: number, options: any) =>
	new Promise((resolve, reject) =>
		fstat(fd, options, (err, stats) => {
			if (err) {
				return reject(err);
			}
			resolve(stats);
		}),
	)) as any;

export const ftruncate: typeof fs.ftruncate = (
	fd,
	len?,
	callback?: fs.NoParamCallback,
) => {
	if (typeof len === "function") {
		return ftruncate(fd, 0, len);
	}
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback?.(errno.EBADF()));
	}
	return truncate(descriptor.path, len, callback as any);
};
ftruncate.__promisify__ = (fd, len) =>
	new Promise((resolve, reject) =>
		ftruncate(fd, len, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const futimes: typeof fs.futimes = (fd, atime, mtime, callback) => {
	checkCallback(callback);
	const descriptor = getFD(fd);
	if (!descriptor) {
		return setImmediate(() => callback(errno.EBADF()));
	}
	return utimes(descriptor.path, atime, mtime, callback);
};
futimes.__promisify__ = (fd, atime, mtime) =>
	new Promise((resolve, reject) =>
		futimes(fd, atime, mtime, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const lchmod: typeof fs.lchmod = () => {
	throw NotImplemented;
};
lchmod.__promisify__ = () => Promise.reject(NotImplemented);

export const lchown: typeof fs.lchown = () => {
	throw NotImplemented;
};
lchown.__promisify__ = () => Promise.reject(NotImplemented);

export const lutimes: typeof fs.lutimes = () => {
	throw NotImplemented;
};
lutimes.__promisify__ = () => Promise.reject(NotImplemented);

export const lstat: typeof fs.lstat = () => {
	throw NotImplemented;
};
lstat.__promisify__ = (() => Promise.reject(NotImplemented)) as any;
