declare module "random-access-file" {
	type ErrorCallback = (err?: Error) => void;
	type ErrorDataCallback = (err: Error | null | undefined, data: Buffer) => void;

	class RandomAccessFile {
		fd?: number;
		write(offset: number, buffer: Buffer, callback?: ErrorCallback): void;
		read(offset: number, length: number, callback: ErrorDataCallback): void;
		del(offset: number, length: number, callback: ErrorCallback): void;
		stat(callback: (err: Error | null | undefined, stat: { size: number }) => void): void;
		close(callback?: ErrorCallback): void;
		destroy(callback?: ErrorCallback): void;
		on(event: "open", callback: () => void): void;
		on(event: "close", callback: () => void): void;
	}

	function randomAccessFile(filename: string, options: {
		truncate: boolean,
		size: number,
		readable: boolean,
		writable: boolean,
		lock: (fd: number) => boolean,
		sparse: (fd: number) => boolean,
	}): RandomAccessFile;

	export default randomAccessFile;
}
