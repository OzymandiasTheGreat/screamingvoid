import type fs from "fs";
interface FileDescriptor {
    path: string;
    flags: number;
    position: number;
    readable: boolean;
    writable: boolean;
    append: boolean;
    size: number;
}
export declare const openFD: (path: fs.PathLike, flags: number) => Promise<number>;
export declare const closeFD: (fd: number) => void;
export declare const getFD: (fd: number) => FileDescriptor | undefined;
export {};
