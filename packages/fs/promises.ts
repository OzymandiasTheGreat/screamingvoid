import { Buffer } from "buffer";
import RNFS from "react-native-fs";
import { linux, parse } from "filesystem-constants";
import type fs from "fs";
import type fsp from "fs/promises";
import * as impl from "./";
import { closeFD, getFD, openFD } from "./fd";
import errno from "./err";
import { Abortable } from "events";
import { NotImplemented } from "./common";

class FileHandle implements fsp.FileHandle {
	private _fd: number;

	constructor(fd: number) {
		this._fd = fd;
	}

	get fd(): number {
		return this._fd;
	}

	appendFile(
		data: string | Uint8Array,
		options?:
			| BufferEncoding
			| (fs.ObjectEncodingOptions & fs.promises.FlagAndOpenMode)
			| null,
	): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		if (options) {
			return new Promise((resolve, reject) =>
				impl.appendFile(fd.path, data, options as any, (err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				}),
			);
		}
		return new Promise((resolve, reject) =>
			impl.appendFile(fd.path, data, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			}),
		);
	}

	chmod(mode: fs.Mode): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return Promise.resolve();
	}

	chown(uid: number, gid: number): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return Promise.resolve();
	}

	close(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				closeFD(this.fd);
				this._fd = -1;
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	createReadStream(
		options?: fs.promises.CreateReadStreamOptions,
	): fs.ReadStream {
		return impl.createReadStream(
			"",
			Object.assign({}, options, { fd: this.fd }) as any,
		);
	}

	createWriteStream(
		options?: fs.promises.CreateWriteStreamOptions,
	): fs.WriteStream {
		return impl.createWriteStream(
			"",
			Object.assign({}, options, { fd: this.fd }) as any,
		);
	}

	datasync(): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return Promise.resolve();
	}

	sync(): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return Promise.resolve();
	}

	read<T extends NodeJS.ArrayBufferView>(
		buffer: T,
		offset?: number | null,
		length?: number | null,
		position?: number | null,
	): Promise<fs.promises.FileReadResult<T>>;
	read<T extends NodeJS.ArrayBufferView = Buffer>(
		options?: fs.promises.FileReadOptions<T>,
	): Promise<fs.promises.FileReadResult<T>>;
	read<T extends NodeJS.ArrayBufferView>(
		buffer?: any,
		offset?: any,
		length?: any,
		position?: any,
	):
		| Promise<fs.promises.FileReadResult<T>>
		| Promise<fs.promises.FileReadResult<T>> {
		return new Promise((resolve, reject) => {
			if (buffer instanceof Uint8Array) {
				return impl.read(
					this.fd,
					buffer,
					offset,
					length,
					position,
					(err, bytesRead, buffer) => {
						if (err) {
							return reject(err);
						}
						resolve({ bytesRead, buffer: buffer as any });
					},
				);
			}
			impl.read(this.fd, buffer, (err, bytesRead, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve({ bytesRead, buffer: buffer as any });
			});
		});
	}

	readFile(
		options?: {
			encoding?: null | undefined;
			flag?: fs.OpenMode | undefined;
		} | null,
	): Promise<Buffer>;
	readFile(
		options:
			| { encoding: BufferEncoding; flag?: fs.OpenMode | undefined }
			| BufferEncoding,
	): Promise<string>;
	readFile(
		options?:
			| BufferEncoding
			| (fs.ObjectEncodingOptions & { flag?: fs.OpenMode | undefined })
			| null,
	): Promise<string | Buffer>;
	readFile(
		options?: any,
	): Promise<Buffer> | Promise<string> | Promise<string | Buffer> {
		return new Promise((resolve, reject) =>
			impl.readFile(this.fd, options, (err, data) => {
				if (err) {
					return reject(err);
				}
				resolve(data);
			}),
		);
	}

	readv(
		buffers: readonly NodeJS.ArrayBufferView[],
		position?: number,
	): Promise<fs.ReadVResult> {
		return new Promise((resolve, reject) =>
			impl.readv(
				this.fd,
				buffers,
				position as any,
				(err, bytesRead, buffers) => {
					if (err) {
						return reject(err);
					}
					resolve({ bytesRead, buffers });
				},
			),
		);
	}

	stat(
		opts?: fs.StatOptions & { bigint?: false | undefined },
	): Promise<fs.Stats>;
	stat(opts: fs.StatOptions & { bigint: true }): Promise<fs.BigIntStats>;
	stat(opts?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats>;
	stat(
		opts?: any,
	):
		| Promise<fs.Stats>
		| Promise<fs.BigIntStats>
		| Promise<fs.Stats | fs.BigIntStats> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return new Promise((resolve, reject) =>
			impl.stat(fd.path, (err, stats) => {
				if (err) {
					return reject(err);
				}
				resolve(stats);
			}),
		);
	}

	truncate(len?: number): Promise<void> {
		return new Promise((resolve, reject) =>
			impl.truncate(this.fd as any, len, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			}),
		);
	}

	utimes(
		atime: string | number | Date,
		mtime: string | number | Date,
	): Promise<void> {
		const fd = getFD(this.fd);
		if (!fd) {
			return Promise.reject(errno.EBADF());
		}
		return new Promise((resolve, reject) =>
			impl.utimes(fd.path, atime, mtime, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			}),
		);
	}

	write<TBuffer extends Uint8Array>(
		buffer: TBuffer,
		offset?: number | null,
		length?: number | null,
		position?: number | null,
	): Promise<{ bytesWritten: number; buffer: TBuffer }>;
	write(
		data: string,
		position?: number | null,
		encoding?: BufferEncoding | null,
	): Promise<{ bytesWritten: number; buffer: string }>;
	write(
		buffer: any,
		offset?: any,
		length?: any,
		position?: any,
	):
		| Promise<{ bytesWritten: number; buffer: any }>
		| Promise<{ bytesWritten: number; buffer: string }> {
		return new Promise((resolve, reject) =>
			impl.write(
				this.fd,
				buffer,
				offset,
				length,
				position,
				(err, bytesWritten, buffer) => {
					if (err) {
						return reject(err);
					}
					resolve({ bytesWritten, buffer });
				},
			),
		);
	}

	writeFile(
		data: string | Uint8Array,
		options?:
			| (fs.ObjectEncodingOptions &
					fs.promises.FlagAndOpenMode &
					Abortable)
			| BufferEncoding
			| null,
	): Promise<void> {
		return new Promise((resolve, reject) =>
			impl.writeFile(this.fd, data, options as any, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			}),
		);
	}

	writev(
		buffers: readonly NodeJS.ArrayBufferView[],
		position?: number,
	): Promise<fs.WriteVResult> {
		return new Promise((resolve, reject) =>
			impl.writev(
				this.fd,
				buffers,
				position as any,
				(err, bytesWritten, buffers) => {
					if (err) {
						return reject(err);
					}
					resolve({ bytesWritten, buffers });
				},
			),
		);
	}
}

export const open: typeof fsp.open = (path, flags, mode) => {
	if (typeof flags !== "number") {
		flags = parse(linux, flags);
	}
	return openFD(path, flags).then((fd) => new FileHandle(fd));
};

export const access: typeof fsp.access = (path, mode) =>
	new Promise((resolve, reject) =>
		impl.access(path, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const appendFile: typeof fsp.appendFile = (path, data, options) =>
	new Promise((resolve, reject) => {
		let pathOrFd: number | fs.PathLike;
		if (path instanceof FileHandle) {
			pathOrFd = path.fd;
		} else {
			pathOrFd = path as fs.PathLike;
		}
		if (options) {
			return impl.appendFile(pathOrFd, data, options as any, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.appendFile(pathOrFd, data, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

export const chmod: typeof fsp.chmod = (path, mode) =>
	new Promise((resolve, reject) =>
		impl.chmod(path, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const chown: typeof fsp.chown = (path, uid, gid) =>
	new Promise((resolve, reject) =>
		impl.chown(path, uid, gid, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const copyFile: typeof fsp.copyFile = (src, dest, mode) =>
	new Promise((resolve, reject) => {
		if (mode) {
			return impl.copyFile(src, dest, mode, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.copyFile(src, dest, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

export const cp: typeof fsp.cp = (src, dest, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.cp(src, dest, options, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.cp(src, dest, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

export const lchmod: typeof fsp.lchmod = (path, mode) =>
	new Promise((resolve, reject) =>
		impl.lchmod(path, mode, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const lchown: typeof fsp.lchown = (path, uid, gid) =>
	new Promise((resolve, reject) =>
		impl.lchown(path, uid, gid, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const lutimes: typeof fsp.lutimes = (path, atime, mtime) =>
	new Promise((resolve, reject) =>
		impl.lutimes(path, atime, mtime, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const link: typeof fsp.link = (existingPath, newPath) =>
	new Promise((resolve, reject) =>
		impl.link(existingPath, newPath, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const lstat: typeof fsp.lstat = (path, options) =>
	new Promise((resolve, reject) =>
		impl.lstat(path, (err, stats) => {
			if (err) {
				return reject(err);
			}
			resolve(stats);
		}),
	) as any;

export const mkdir: typeof fsp.mkdir = (path, options) =>
	new Promise<void>((resolve, reject) => {
		if (options) {
			return impl.mkdir(path, options, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.mkdir(path, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	}) as any;

export const mkdtemp: typeof fsp.mkdtemp = (prefix, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.mkdtemp(prefix, options as any, (err, folder) => {
				if (err) {
					return reject(err);
				}
				resolve(folder);
			});
		}
		impl.mkdtemp(prefix, (err, folder) => {
			if (err) {
				return reject(err);
			}
			resolve(folder);
		});
	}) as any;

export const opendir: typeof fsp.opendir = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.opendir(path, options, (err, dir) => {
				if (err) {
					return reject(err);
				}
				resolve(dir);
			});
		}
		impl.opendir(path, (err, dir) => {
			if (err) {
				return reject(err);
			}
			resolve(dir);
		});
	});

export const readdir: typeof fsp.readdir = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.readdir(path, options as any, (err, files) => {
				if (err) {
					return reject(err);
				}
				resolve(files);
			});
		}
		impl.readdir(path, (err, files) => {
			if (err) {
				return reject(err);
			}
			resolve(files);
		});
	}) as any;

export const readFile: typeof fsp.readFile = (path, options) =>
	new Promise((resolve, reject) => {
		let pathOrFd: number | fs.PathLike;
		if (path instanceof FileHandle) {
			pathOrFd = path.fd;
		} else {
			pathOrFd = path as fs.PathLike;
		}
		if (options) {
			return impl.readFile(pathOrFd, options as any, (err, content) => {
				if (err) {
					return reject(err);
				}
				resolve(content);
			});
		}
		impl.readFile(pathOrFd, (err, content) => {
			if (err) {
				return reject(err);
			}
			resolve(content);
		});
	}) as any;

export const readlink: typeof fsp.readlink = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.readlink(path, options as any, (err, link) => {
				if (err) {
					return reject(err);
				}
				resolve(link);
			});
		}
		impl.readlink(path, (err, link) => {
			if (err) {
				return reject(err);
			}
			resolve(link);
		});
	}) as any;

export const realpath: typeof fsp.realpath = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.realpath(path, options as any, (err, path) => {
				if (err) {
					return reject(err);
				}
				resolve(path);
			});
		}
		impl.realpath(path, (err, path) => {
			if (err) {
				return reject(err);
			}
			resolve(path);
		});
	}) as any;

export const rename: typeof fsp.rename = (oldPath, newPath) =>
	new Promise((resolve, reject) =>
		impl.rename(oldPath, newPath, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const rmdir: typeof fsp.rmdir = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.rmdir(path, options, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.rmdir(path, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

export const rm: typeof fsp.rm = (path, options) =>
	new Promise((resolve, reject) => {
		if (options) {
			return impl.rm(path, options, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		}
		impl.rm(path, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

export const stat: typeof fsp.stat = (path, options) =>
	new Promise((resolve, reject) =>
		impl.stat(path, (err, stats) => {
			if (err) {
				return reject(err);
			}
			resolve(stats);
		}),
	) as any;

export const symlink: typeof fsp.symlink = (target, path, type) =>
	new Promise((resolve, reject) =>
		impl.symlink(target, path, type as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const truncate: typeof fsp.truncate = (path, len) =>
	new Promise((resolve, reject) =>
		impl.truncate(path, len, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const unlink: typeof fsp.unlink = (path) =>
	new Promise((resolve, reject) =>
		impl.unlink(path, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const utimes: typeof fsp.utimes = (path, atime, mtime) =>
	new Promise((resolve, reject) =>
		impl.utimes(path, atime, mtime, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		}),
	);

export const watch: typeof fsp.watch = (path, options) => {
	throw NotImplemented;
};

export const writeFile: typeof fsp.writeFile = (path, data, options) =>
	new Promise((resolve, reject) => {
		let pathOrFd: number | fs.PathLike;
		if (path instanceof FileHandle) {
			pathOrFd = path.fd;
		} else {
			pathOrFd = path as fs.PathLike;
		}
		if (options) {
			return impl.writeFile(
				pathOrFd,
				data as any,
				options as any,
				(err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				},
			);
		}
		impl.writeFile(pathOrFd, data as any, (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
