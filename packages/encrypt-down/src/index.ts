import {
	AbstractLevelDOWN,
	AbstractIterator,
	AbstractGetOptions,
	AbstractBatch,
	AbstractIteratorOptions,
} from "abstract-leveldown";
import Sodium from "sodium-universal";

export class EncryptedIterator extends AbstractIterator {
	private publicKey: Buffer;
	private secretKey: Buffer;
	private options: AbstractIteratorOptions;
	private iterator: AbstractIterator<any, any>;
	constructor(db: AbstractLevelDOWN, options: AbstractIteratorOptions) {
		super(db);
		this.options = options;
		this.publicKey = db.publicKey;
		this.secretKey = db.secretKey;
		this.iterator = db.level.iterator(
			Object.assign({}, options, { valueAsBuffer: true }),
		);
	}

	private _next(callback: any) {
		return this.iterator.next((err: any, key: any, cipher?: Buffer) => {
			if (err) {
				return callback(err);
			}
			if (typeof key === "undefined" && typeof cipher === "undefined") {
				return callback();
			}
			let value;
			if (typeof cipher !== "undefined") {
				value = Buffer.alloc(
					cipher.byteLength - Sodium.crypto_box_SEALBYTES,
				);
				Sodium.crypto_box_seal_open(
					value,
					cipher,
					this.publicKey,
					this.secretKey,
				);
			}
			callback(
				null,
				key,
				value &&
					(this.options.valueAsBuffer ? value : value.toString()),
			);
		});
	}

	private _seek(target: any) {
		return this.iterator.seek(target);
	}

	private _end(callback: any) {
		return this.iterator.end(callback);
	}
}

export class EncryptDown extends AbstractLevelDOWN {
	private level: AbstractLevelDOWN;
	private publicKey: Buffer;
	private secretKey: Buffer;

	constructor(db: AbstractLevelDOWN, key: Buffer) {
		// @ts-ignore
		super(db.supports || {});
		this.level = db;
		this.publicKey = Buffer.alloc(Sodium.crypto_box_PUBLICKEYBYTES);
		this.secretKey = Buffer.alloc(Sodium.crypto_box_SECRETKEYBYTES);
		Sodium.crypto_box_seed_keypair(this.publicKey, this.secretKey, key);
	}

	private _serializeKey(key: any) {
		return key;
	}

	private _serializeValue(value: any) {
		if (value instanceof Uint8Array) {
			return value;
		}
		if (typeof value === "string") {
			return Buffer.from(value);
		}
		if (Array.isArray(value)) {
			return Buffer.from(value.join(","));
		}
		if (typeof value === "number" && isNaN(value)) {
			return Buffer.from("NaN");
		}
		return Buffer.from(JSON.stringify(value));
	}

	private _open(options: any, callback: any) {
		return this.level.open(options, callback);
	}

	private _close(callback: any) {
		return this.level.close(callback);
	}

	private _put(key: any, value: Buffer, options: any, callback: any) {
		const cipher = Buffer.alloc(
			value.byteLength + Sodium.crypto_box_SEALBYTES,
		);
		Sodium.crypto_box_seal(cipher, value, this.publicKey);
		return this.level.put(key, cipher, options, callback);
	}

	private _get(key: any, options: AbstractGetOptions, callback: any) {
		return this.level.get(key, { asBuffer: true }, (err, cipher) => {
			if (err) {
				return callback(err);
			}
			const value = Buffer.alloc(
				cipher.byteLength - Sodium.crypto_box_SEALBYTES,
			);
			const res = Sodium.crypto_box_seal_open(
				value,
				cipher,
				this.publicKey,
				this.secretKey,
			);
			if (!res) {
				return callback(new Error("EncryptionError"));
			}
			callback(null, options.asBuffer ? value : value.toString());
		});
	}

	private _getMany(keys: any[], options: AbstractGetOptions, callback: any) {
		return this.level.getMany(keys, { asBuffer: true }, (err, ciphers) => {
			if (err) {
				return callback(err);
			}
			const values: (Buffer | undefined)[] = [];
			for (let cipher of ciphers) {
				if (typeof cipher !== "undefined") {
					const value = Buffer.alloc(
						cipher.byteLength - Sodium.crypto_box_SEALBYTES,
					);
					const res = Sodium.crypto_box_seal_open(
						value,
						cipher,
						this.publicKey,
						this.secretKey,
					);
					if (!res) {
						return callback(new Error("EncryptionError"));
					}
					values.push(value);
				} else {
					values.push(cipher);
				}
			}
			callback(
				null,
				options.asBuffer
					? values
					: values.map((v) => v && v.toString()),
			);
		});
	}

	private _del(key: any, options: any, callback: any) {
		return this.level.del(key, options, callback);
	}

	private _batch(operations: AbstractBatch[], options: any, callback: any) {
		const ops = operations.map((op) => {
			if (op.type === "put") {
				const cipher = Buffer.alloc(
					op.value.byteLength + Sodium.crypto_box_SEALBYTES,
				);
				Sodium.crypto_box_seal(cipher, op.value, this.publicKey);
				return Object.assign({}, op, { value: cipher });
			} else {
				return op;
			}
		});
		return this.level.batch(ops, options, callback);
	}

	private _clear(options: any, callback: any) {
		return this.level.clear(options, callback);
	}

	private _iterator(options: AbstractIteratorOptions) {
		return new EncryptedIterator(this, options);
	}
}
