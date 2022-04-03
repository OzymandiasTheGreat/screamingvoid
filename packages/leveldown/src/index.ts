import { Buffer } from "buffer";
import {
	AbstractBatch,
	AbstractChainedBatch,
	AbstractGetOptions,
	AbstractIterator,
	AbstractIteratorOptions,
	AbstractLevelDOWN,
	AbstractOpenOptions,
	AbstractOptions,
	ErrorCallback,
	ErrorKeyValueCallback,
} from "abstract-leveldown";
import { Level } from "./LevelDB";

export class LevelDownIterator extends AbstractIterator {
	private instance: number;
	private iterator: number;
	private options: AbstractIteratorOptions;
	private index: number = 0;

	constructor(
		options: AbstractIteratorOptions,
		db: LevelDown,
		instance: number,
	) {
		super(db);
		this.instance = instance;
		this.options = options;
		this.iterator = Level.iterator_init(this.instance, this.options);
	}

	_next(callback: ErrorKeyValueCallback<any, any>) {
		setImmediate(() => {
			Level.iterator_next(
				this.iterator,
				this.options,
				this.index,
				(
					err: Error | null | undefined,
					key?: Uint8Array,
					value?: Uint8Array,
				) => {
					if (err) {
						return callback(err, undefined, undefined);
					}
					if (
						typeof key === "undefined" &&
						typeof value === "undefined"
					) {
						return callback(null, undefined, undefined);
					}
					const keybuf = Buffer.from(
						key.buffer,
						key.byteOffset,
						key.byteLength,
					);
					const valbuf = Buffer.from(
						value.buffer,
						value.byteOffset,
						value.byteLength,
					);
					callback(
						null,
						this.options.keyAsBuffer ? keybuf : keybuf.toString(),
						this.options.valueAsBuffer
							? valbuf
							: valbuf.toString(),
					);
				},
			);
			this.index++;
		});
	}

	_seek(target: any) {
		Level.iterator_seek(this.iterator, this.options, target);
	}

	_end(callback: any) {
		setImmediate(() => {
			Level.iterator_end(this.iterator, callback);
		});
	}
}

export class LevelDown extends AbstractLevelDOWN {
	private instance: number;
	private location: string;

	constructor(location: string) {
		// @ts-ignore
		super({
			bufferKeys: true,
			snapshots: true,
			permanence: true,
			seek: true,
			clear: true,
			getMany: true,
			createIfMissing: true,
			errorIfExists: true,
			additionalMethods: {
				approximateSize: true,
				compactRange: true,
			},
		});
		this.location = location;
	}

	open(cb: ErrorCallback): void;
	open(
		options: AbstractOpenOptions & { compression?: boolean },
		cb: ErrorCallback,
	): void;
	open(options: any, cb?: any): void {
		super.open(options, cb);
	}

	private _open(options: any, callback: any) {
		setImmediate(() => {
			const result = Level.open(Buffer.from(this.location), options);
			if (typeof result === "number") {
				this.instance = result;
				callback(null);
			} else {
				callback(result);
			}
		});
	}

	private _close(callback: any) {
		setImmediate(() => {
			Level.close(this.instance);
			this.instance = null;
			callback();
		});
	}

	private _serialize(val: any) {
		if (val instanceof Uint8Array) {
			return val;
		}
		if (typeof val === "string") {
			return Buffer.from(val);
		}
		if (Array.isArray(val)) {
			return Buffer.from(val.join(","));
		}
		if (typeof val === "number" && isNaN(val)) {
			return Buffer.from("NaN");
		}
		return Buffer.from(JSON.stringify(val));
	}

	private _serializeKey(key: any) {
		return this._serialize(key);
	}

	private _serializeValue(value: any) {
		return this._serialize(value);
	}

	put(key: any, value: any, cb: ErrorCallback): void;
	put(
		key: any,
		value: any,
		options: AbstractOptions & { sync?: boolean },
		cb: ErrorCallback,
	): void;
	put(key: any, value: any, options: any, cb?: any): void {
		super.put(key, value, options, cb);
	}

	private _put(key: any, value: any, options: any, callback: any) {
		setImmediate(() =>
			Level.put(this.instance, key, value, options, callback),
		);
	}

	private _get(key: any, options: AbstractGetOptions, callback: any) {
		setImmediate(() => {
			const value: Uint8Array = Level.get(this.instance, key);
			if (value instanceof Uint8Array) {
				const valbuf = Buffer.from(
					value.buffer,
					value.byteOffset,
					value.byteLength,
				);
				callback(null, options.asBuffer ? valbuf : valbuf.toString());
			} else {
				callback(new Error("NotFound"));
			}
		});
	}

	private _getMany(keys: any, options: AbstractGetOptions, callback: any) {
		setImmediate(() => {
			try {
				const values: (Uint8Array | null)[] = Level.getMany(
					this.instance,
					keys,
				);
				callback(
					undefined,
					values.map((v) => {
						if (v) {
							const vbuf = Buffer.from(
								v.buffer,
								v.byteOffset,
								v.byteLength,
							);
							return options.asBuffer ? vbuf : vbuf.toString();
						}
						return v;
					}),
				);
			} catch (err) {
				callback(err);
			}
		});
	}

	del(key: any, cb: ErrorCallback): void;
	del(
		key: any,
		options: AbstractOptions & { sync?: boolean },
		cb: ErrorCallback,
	): void;
	del(key: any, options: any, cb?: any): void {
		super.del(key, options, cb);
	}

	private _del(key: any, options: any, callback: any) {
		setImmediate(() => Level.del(this.instance, key, options, callback));
	}

	batch(): AbstractChainedBatch<any, any>;
	batch(
		array: readonly AbstractBatch<any, any>[],
		cb: ErrorCallback,
	): AbstractChainedBatch<any, any>;
	batch(
		array: readonly AbstractBatch<any, any>[],
		options: AbstractOptions & { sync?: boolean },
		cb: ErrorCallback,
	): AbstractChainedBatch<any, any>;
	batch(
		array?: any,
		options?: any,
		cb?: any,
	): AbstractChainedBatch<any, any> {
		if (!arguments.length) return super.batch();
		return super.batch(array, options, cb);
	}

	private _batch(
		operations: AbstractBatch<any, any>[],
		options: any,
		callback: any,
	) {
		setImmediate(() => {
			if (
				operations.some(
					(op) =>
						typeof op.key === "undefined" ||
						op.key === null ||
						(op.type === "put" &&
							(typeof op.value === "undefined" ||
								op.value === null)),
				)
			) {
				return callback(new Error("Invalid batch"));
			}
			Level.batch(this.instance, operations, options, callback);
		});
	}

	approximateSize(
		start: string | Buffer,
		end: string | Buffer,
		callback: (err: Error | null | undefined, size: number) => void,
	) {
		setImmediate(() =>
			Level.approximateSize(
				this.instance,
				this._serializeKey(start),
				this._serializeKey(end),
				callback,
			),
		);
	}

	private _iterator(options: AbstractIteratorOptions) {
		return new LevelDownIterator(options, this, this.instance);
	}

	private _clear(options: AbstractIteratorOptions, callback: ErrorCallback) {
		setImmediate(() => Level.clear(this.instance, options, callback));
	}
}
