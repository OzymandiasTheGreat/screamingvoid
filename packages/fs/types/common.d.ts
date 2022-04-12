/// <reference types="node" />
import RNFS from "react-native-fs";
import type fs from "fs";
export declare const NotImplemented: Error;
export declare class Dirent implements fs.Dirent {
    private _item;
    constructor(item: RNFS.ReadDirItem);
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isDirectory(): boolean;
    isFIFO(): boolean;
    isFile(): boolean;
    isSocket(): boolean;
    isSymbolicLink(): boolean;
    get name(): string;
}
export declare class Dir implements fs.Dir {
    private _path;
    private _encoding;
    private _closed;
    private _prev?;
    private _prevIndex;
    constructor(path: fs.PathLike, encoding?: BufferEncoding);
    get path(): string;
    close(): Promise<void>;
    close(callback: fs.NoParamCallback): void;
    closeSync(): void;
    read(): Promise<fs.Dirent | null>;
    read(cb: (err: NodeJS.ErrnoException | null, dirEnt: fs.Dirent | null) => void): void;
    readSync(): fs.Dirent | null;
    [Symbol.asyncIterator](): AsyncGenerator<fs.Dirent, void, unknown>;
}
export declare class Stats implements fs.Stats {
    private _stat;
    constructor(stat: RNFS.StatResult);
    get atime(): Date;
    get atimeMs(): number;
    get mtime(): Date;
    get mtimeMs(): number;
    get ctime(): Date;
    get ctimeMs(): number;
    get birthtime(): Date;
    get birthtimeMs(): number;
    get dev(): number;
    get ino(): number;
    get mode(): number;
    get nlink(): number;
    get gid(): number;
    get uid(): number;
    get rdev(): number;
    get size(): number;
    get blksize(): number;
    get blocks(): number;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isDirectory(): boolean;
    isFIFO(): boolean;
    isFile(): boolean;
    isSocket(): boolean;
    isSymbolicLink(): boolean;
}
