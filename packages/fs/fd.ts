import type fs from "fs";
import { linux } from "filesystem-constants";
import RNFS from "react-native-fs";
import errno from "./err";

interface FileDescriptor {
	path: string;
	flags: number;
	position: number;
	readable: boolean;
	writable: boolean;
	append: boolean;
	size: number;
}

const FDs: Record<number, FileDescriptor> = {};

export const openFD = async (
	path: fs.PathLike,
	flags: number,
): Promise<number> => {
	const stat = await RNFS.stat(path.toString()).catch(() => null);
	if (stat?.isDirectory()) {
		throw errno.EISDIR(path.toString());
	}
	if (stat && (flags & linux.O_EXCL) === linux.O_EXCL) {
		throw errno.EEXIST(path.toString());
	}
	if (!stat && (flags & linux.O_CREAT) !== linux.O_CREAT) {
		throw errno.ENOENT(path.toString());
	}
	const readable =
		(flags & linux.O_WRONLY) !== linux.O_WRONLY ||
		(flags & linux.O_RDWR) === linux.O_RDWR;
	const writable =
		(flags & linux.O_WRONLY) === linux.O_WRONLY ||
		(flags & linux.O_RDWR) === linux.O_RDWR;
	const append = (flags & linux.O_APPEND) === linux.O_APPEND;
	const fd: FileDescriptor = {
		path: path.toString(),
		flags,
		position: append ? stat?.size || 0 : 0,
		readable,
		writable,
		append,
		size: stat?.size || 0,
	};
	if (stat && (flags & linux.O_TRUNC) === linux.O_TRUNC) {
		await RNFS.writeFile(path.toString(), "");
	}
	if (!stat && writable && (flags & linux.O_CREAT) === linux.O_CREAT) {
		await RNFS.writeFile(path.toString(), "");
	}
	const index = Math.max(...Object.keys(FDs).map((k) => parseInt(k)), 0) + 1;
	FDs[index] = fd;
	return index;
};

export const closeFD = (fd: number): void => {
	const descriptor = FDs[fd];
	if (!descriptor) {
		throw errno.EBADF();
	}
	delete FDs[fd];
};

export const getFD = (fd: number): FileDescriptor | undefined => {
	const descriptor = FDs[fd];
	return descriptor;
};
