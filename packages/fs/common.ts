import { Buffer } from "buffer";
import RNFS from "react-native-fs";
import type fs from "fs";
import errno from "./err";

export const NotImplemented = new Error("NotImplemented");

export class Dirent implements fs.Dirent {
	private _item: RNFS.ReadDirItem;

	constructor(item: RNFS.ReadDirItem) {
		this._item = item;
	}

	isBlockDevice(): boolean {
		return false;
	}

	isCharacterDevice(): boolean {
		return false;
	}

	isDirectory(): boolean {
		return this._item.isDirectory();
	}

	isFIFO(): boolean {
		return false;
	}

	isFile(): boolean {
		return this._item.isFile();
	}

	isSocket(): boolean {
		return false;
	}

	isSymbolicLink(): boolean {
		return false;
	}

	get name(): string {
		return this._item.name;
	}
}

export class Dir implements fs.Dir {
	private _path: string;
	private _encoding: BufferEncoding;
	private _closed = false;
	private _prev?: RNFS.ReadDirItem;
	private _prevIndex = -1;

	constructor(path: fs.PathLike, encoding?: BufferEncoding) {
		this._path = encoding
			? typeof path === "string"
				? Buffer.from(path, encoding).toString()
				: path.toString(encoding)
			: path.toString();
		this._encoding = encoding || "utf8";
	}

	get path(): string {
		return this._path;
	}

	close(): Promise<void>;
	close(callback: fs.NoParamCallback): void;
	close(callback?: fs.NoParamCallback): void | Promise<void> {
		let err = null;
		if (this._closed) {
			err = errno.EBADF();
		}
		if (callback) {
			return callback(err);
		}
		if (err) {
			return Promise.reject(err);
		}
		return Promise.resolve();
	}

	closeSync(): void {
		throw NotImplemented;
	}

	read(): Promise<fs.Dirent | null>;
	read(
		cb: (
			err: NodeJS.ErrnoException | null,
			dirEnt: fs.Dirent | null,
		) => void,
	): void;
	read(cb?: any): void | Promise<fs.Dirent | null> {
		if (cb) {
			RNFS.readDir(this._path)
				.then((items) => {
					const prev = this._prev || items[this._prevIndex];
					if (!prev) {
						return cb(null, null);
					}
					const index =
						items.findIndex((i) => i.path === prev.path) + 1 ||
						this._prevIndex + 1;
					const item = items[index];
					if (!item) {
						return cb(null, null);
					}
					this._prev = item;
					this._prevIndex = index;
					return cb(null, new Dirent(item));
				})
				.catch(cb);
			return;
		}
		return RNFS.readDir(this._path).then((items) => {
			const prev = this._prev || items[this._prevIndex];
			if (!prev) {
				return null;
			}
			const index =
				items.findIndex((i) => i.path === prev.path) + 1 ||
				this._prevIndex + 1;
			const item = items[index];
			if (!item) {
				return null;
			}
			this._prev = item;
			this._prevIndex = index;
			return new Dirent(item);
		});
	}

	readSync(): fs.Dirent | null {
		throw NotImplemented;
	}

	async *[Symbol.asyncIterator]() {
		const dirent = await this.read();
		if (!dirent) {
			return;
		}
		yield dirent;
	}
}

export class Stats implements fs.Stats {
	private _stat: RNFS.StatResult;

	constructor(stat: RNFS.StatResult) {
		this._stat = stat;
	}

	get atime(): Date {
		return this._stat.mtime as any;
	}

	get atimeMs(): number {
		return (this._stat.mtime as any).getTime();
	}

	get mtime(): Date {
		return this._stat.mtime as any;
	}

	get mtimeMs(): number {
		return (this._stat.mtime as any).getTime();
	}

	get ctime(): Date {
		return this._stat.ctime as any;
	}

	get ctimeMs(): number {
		return (this._stat.ctime as any).getTime();
	}

	get birthtime(): Date {
		return this._stat.ctime as any;
	}

	get birthtimeMs(): number {
		return (this._stat.ctime as any).getTime();
	}

	get dev(): number {
		return 0;
	}

	get ino(): number {
		return 0;
	}

	get mode(): number {
		if (this._stat.isDirectory()) {
			return 0o777;
		}
		return 0o666;
	}

	get nlink(): number {
		return 1;
	}

	get gid(): number {
		return 1000;
	}

	get uid(): number {
		return 1000;
	}

	get rdev(): number {
		return 0;
	}

	get size(): number {
		return this._stat.size;
	}

	get blksize(): number {
		return 4096;
	}

	get blocks(): number {
		return 8;
	}

	isBlockDevice(): boolean {
		return false;
	}

	isCharacterDevice(): boolean {
		return false;
	}

	isDirectory(): boolean {
		return this._stat.isDirectory();
	}

	isFIFO(): boolean {
		return false;
	}

	isFile(): boolean {
		return this._stat.isFile();
	}

	isSocket(): boolean {
		return false;
	}

	isSymbolicLink(): boolean {
		return false;
	}
}
