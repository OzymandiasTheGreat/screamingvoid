"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptDown = exports.EncryptedIterator = void 0;
const abstract_leveldown_1 = require("abstract-leveldown");
const sodium_universal_1 = __importDefault(require("sodium-universal"));
class EncryptedIterator extends abstract_leveldown_1.AbstractIterator {
    constructor(db, options) {
        super(db);
        this.options = options;
        this.publicKey = db.publicKey;
        this.secretKey = db.secretKey;
        this.iterator = db.level.iterator(Object.assign({}, options, { valueAsBuffer: true }));
    }
    _next(callback) {
        return this.iterator.next((err, key, cipher) => {
            if (err) {
                return callback(err);
            }
            if (typeof key === "undefined" && typeof cipher === "undefined") {
                return callback();
            }
            let value;
            if (typeof cipher !== "undefined") {
                value = Buffer.alloc(cipher.byteLength - sodium_universal_1.default.crypto_box_SEALBYTES);
                sodium_universal_1.default.crypto_box_seal_open(value, cipher, this.publicKey, this.secretKey);
            }
            callback(null, key, value &&
                (this.options.valueAsBuffer ? value : value.toString()));
        });
    }
    _seek(target) {
        return this.iterator.seek(target);
    }
    _end(callback) {
        return this.iterator.end(callback);
    }
}
exports.EncryptedIterator = EncryptedIterator;
class EncryptDown extends abstract_leveldown_1.AbstractLevelDOWN {
    constructor(db, key) {
        // @ts-ignore
        super(db.supports || {});
        this.level = db;
        this.publicKey = Buffer.alloc(sodium_universal_1.default.crypto_box_PUBLICKEYBYTES);
        this.secretKey = Buffer.alloc(sodium_universal_1.default.crypto_box_SECRETKEYBYTES);
        sodium_universal_1.default.crypto_box_seed_keypair(this.publicKey, this.secretKey, key);
    }
    _serializeKey(key) {
        return key;
    }
    _serializeValue(value) {
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
    _open(options, callback) {
        return this.level.open(options, callback);
    }
    _close(callback) {
        return this.level.close(callback);
    }
    _put(key, value, options, callback) {
        const cipher = Buffer.alloc(value.byteLength + sodium_universal_1.default.crypto_box_SEALBYTES);
        sodium_universal_1.default.crypto_box_seal(cipher, value, this.publicKey);
        return this.level.put(key, cipher, options, callback);
    }
    _get(key, options, callback) {
        return this.level.get(key, { asBuffer: true }, (err, cipher) => {
            if (err) {
                return callback(err);
            }
            const value = Buffer.alloc(cipher.byteLength - sodium_universal_1.default.crypto_box_SEALBYTES);
            const res = sodium_universal_1.default.crypto_box_seal_open(value, cipher, this.publicKey, this.secretKey);
            if (!res) {
                return callback(new Error("EncryptionError"));
            }
            callback(null, options.asBuffer ? value : value.toString());
        });
    }
    _getMany(keys, options, callback) {
        return this.level.getMany(keys, { asBuffer: true }, (err, ciphers) => {
            if (err) {
                return callback(err);
            }
            const values = [];
            for (let cipher of ciphers) {
                if (typeof cipher !== "undefined") {
                    const value = Buffer.alloc(cipher.byteLength - sodium_universal_1.default.crypto_box_SEALBYTES);
                    const res = sodium_universal_1.default.crypto_box_seal_open(value, cipher, this.publicKey, this.secretKey);
                    if (!res) {
                        return callback(new Error("EncryptionError"));
                    }
                    values.push(value);
                }
                else {
                    values.push(cipher);
                }
            }
            callback(null, options.asBuffer
                ? values
                : values.map((v) => v && v.toString()));
        });
    }
    _del(key, options, callback) {
        return this.level.del(key, options, callback);
    }
    _batch(operations, options, callback) {
        const ops = operations.map((op) => {
            if (op.type === "put") {
                const cipher = Buffer.alloc(op.value.byteLength + sodium_universal_1.default.crypto_box_SEALBYTES);
                sodium_universal_1.default.crypto_box_seal(cipher, op.value, this.publicKey);
                return Object.assign({}, op, { value: cipher });
            }
            else {
                return op;
            }
        });
        return this.level.batch(ops, options, callback);
    }
    _clear(options, callback) {
        return this.level.clear(options, callback);
    }
    _iterator(options) {
        return new EncryptedIterator(this, options);
    }
}
exports.EncryptDown = EncryptDown;
