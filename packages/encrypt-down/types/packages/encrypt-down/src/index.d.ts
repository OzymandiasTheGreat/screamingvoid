/// <reference types="node" />
import { AbstractLevelDOWN, AbstractIterator, AbstractIteratorOptions } from "abstract-leveldown";
export declare class EncryptedIterator extends AbstractIterator {
    private publicKey;
    private secretKey;
    private options;
    private iterator;
    constructor(db: AbstractLevelDOWN, options: AbstractIteratorOptions);
    private _next;
    private _seek;
    private _end;
}
export declare class EncryptDown extends AbstractLevelDOWN {
    private db;
    private publicKey;
    private secretKey;
    constructor(db: AbstractLevelDOWN, key: Buffer);
    private _serializeKey;
    private _serializeValue;
    private _open;
    private _close;
    private _put;
    private _get;
    private _getMany;
    private _del;
    private _batch;
    private _clear;
    private _iterator;
}
