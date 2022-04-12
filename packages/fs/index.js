"use strict";
exports.lstat = exports.lutimes = exports.lchown = exports.lchmod = exports.futimes = exports.ftruncate = exports.fstat = exports.fsync = exports.fdatasync = exports.fchown = exports.fchmod = exports.unwatchFile = exports.watchFile = exports.watch = exports.symlink = exports.rename = exports.realpath = exports.readlink = exports.link = exports.exists = exports.chown = exports.chmod = exports.access = exports.utimes = exports.stat = exports.truncate = exports.rm = exports.unlink = exports.rmdir = exports.readdir = exports.opendir = exports.mkdtemp = exports.mkdir = exports.cp = exports.copyFile = exports.close = exports.readFile = exports.readv = exports.read = exports.createReadStream = exports.createWriteStream = exports.writev = exports.write = exports.appendFile = exports.writeFile = exports.open = exports.constants = void 0;
var _buffer = require("buffer");
var _path = require("path");
var _reactNativeFs = _interopRequireDefault(require("react-native-fs"));
var _nonSecure = require("nanoid/non-secure");
var _filesystemConstants = require("filesystem-constants");
var _readableStream = require("readable-stream");
var _err = _interopRequireDefault(require("./err"));
var _common = require("./common");
var _fd = require("./fd");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const checkCallback = (callback)=>{
    if (typeof callback !== "function") {
        throw new TypeError("Callback must be a function");
    }
};
const constants = _filesystemConstants.linux;
exports.constants = constants;
const open = (path, flags, mode, callback)=>{
    if (typeof flags === "function") {
        return open(path, "r", 438, flags);
    }
    if (typeof mode === "function") {
        return open(path, flags, 438, mode);
    }
    if (typeof flags === "undefined" && callback) {
        return open(path, "r", mode, callback);
    }
    if (typeof mode === "undefined" && callback) {
        return open(path, flags, 438, callback);
    }
    checkCallback(callback);
    const fl = typeof flags === "number" ? flags : (0, _filesystemConstants).parse(_filesystemConstants.linux, flags);
    (0, _fd).openFD(path, fl).then((fd)=>{
        return callback === null || callback === void 0 ? void 0 : callback(null, fd);
    }).catch((err)=>{
        return callback === null || callback === void 0 ? void 0 : callback(err, -1);
    });
};
exports.open = open;
open.__promisify__ = (path, flags, mode)=>new Promise((resolve, reject)=>open(path, flags, mode, (err, fd)=>{
            if (err) {
                return reject(err);
            }
            resolve(fd);
        })
    )
;
const writeFile = (path, data, options, callback)=>{
    if (typeof options === "function") {
        return writeFile(path, data, {
            encoding: "utf8"
        }, options);
    }
    if (typeof options === "undefined" && callback) {
        return writeFile(path, data, {
            encoding: "utf8"
        }, callback);
    }
    checkCallback(callback);
    let out;
    if (data instanceof Uint8Array) {
        out = _buffer.Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    } else {
        out = _buffer.Buffer.from(data.toString(), typeof options === "string" ? options : options === null || options === void 0 ? void 0 : options.encoding);
    }
    if (typeof path === "number") {
        const fd = (0, _fd).getFD(path);
        if (!(fd === null || fd === void 0 ? void 0 : fd.writable)) {
            return setImmediate(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.EBADF());
            });
        }
        _reactNativeFs.default.write(fd.path, out.toString("base64"), fd.position, "base64").then(()=>{
            fd.position += out.byteLength;
            callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    } else {
        _reactNativeFs.default.writeFile(path.toString(), out.toString("base64"), "base64").then(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    }
};
exports.writeFile = writeFile;
writeFile.__promisify__ = (path, data, options)=>new Promise((resolve, reject)=>writeFile(path, data, options, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const appendFile = (path, data, options, callback)=>{
    if (typeof options === "function") {
        return appendFile(path, data, {
            encoding: "utf8"
        }, options);
    }
    if (typeof options === "undefined" && callback) {
        return appendFile(path, data, {
            encoding: "utf8"
        }, callback);
    }
    checkCallback(callback);
    let out;
    if (data instanceof Uint8Array) {
        out = _buffer.Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    } else {
        out = _buffer.Buffer.from(data.toString(), typeof options === "string" ? options : options === null || options === void 0 ? void 0 : options.encoding);
    }
    if (typeof path === "number") {
        const fd = (0, _fd).getFD(path);
        if (!(fd === null || fd === void 0 ? void 0 : fd.append)) {
            return setImmediate(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.EBADF());
            });
        }
        _reactNativeFs.default.appendFile(fd.path, out.toString("base64"), "base64").then(()=>{
            fd.position += out.byteLength;
            callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    } else {
        _reactNativeFs.default.appendFile(path.toString(), out.toString("base64"), "base64").then(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    }
};
exports.appendFile = appendFile;
appendFile.__promisify__ = (path, data, options)=>new Promise((resolve, reject)=>appendFile(path, data, options, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
function writeImpl(fd, data, offsetOrPos, lengthOrEnc, posOrCB, callback) {
    const descriptor = (0, _fd).getFD(fd);
    if (data instanceof Uint8Array) {
        if (typeof offsetOrPos === "function") {
            return writeImpl(fd, data, data.byteOffset, data.byteLength, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, offsetOrPos);
        }
        if (typeof lengthOrEnc === "function") {
            return writeImpl(fd, data, data.byteOffset, data.byteLength, offsetOrPos, lengthOrEnc);
        }
        if (typeof posOrCB === "function") {
            return writeImpl(fd, data, offsetOrPos, lengthOrEnc, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, posOrCB);
        }
        if (typeof offsetOrPos === "undefined") {
            return writeImpl(fd, data, data.byteOffset || (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position), lengthOrEnc, posOrCB, callback);
        }
        if (typeof lengthOrEnc === "undefined") {
            return writeImpl(fd, data, data.byteOffset, data.byteLength, offsetOrPos, callback);
        }
        if (typeof posOrCB === "undefined") {
            return writeImpl(fd, data, offsetOrPos, lengthOrEnc, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, callback);
        }
    }
    if (typeof data === "string") {
        if (typeof offsetOrPos === "function") {
            return writeImpl(fd, data, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, "utf8", offsetOrPos);
        }
        if (typeof offsetOrPos === "string") {
            return writeImpl(fd, data, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, offsetOrPos, lengthOrEnc);
        }
        if (typeof lengthOrEnc === "function") {
            return writeImpl(fd, data, offsetOrPos, "utf8", lengthOrEnc);
        }
        if (typeof callback === "function") {
            if (typeof lengthOrEnc === "string") {
                data = _buffer.Buffer.from(data, lengthOrEnc);
                return writeImpl(fd, data, 0, data.length, offsetOrPos, callback);
            }
            return writeImpl(fd, _buffer.Buffer.from(data), offsetOrPos, lengthOrEnc, posOrCB, callback);
        }
        if (typeof offsetOrPos === "undefined") {
            return writeImpl(fd, data, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, lengthOrEnc, posOrCB);
        }
        if (typeof lengthOrEnc === "undefined") {
            return writeImpl(fd, data, offsetOrPos, "utf8", posOrCB);
        }
    }
    if (typeof data === "string") {
        if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.writable)) {
            setImmediate(()=>posOrCB(_err.default.EBADF())
            );
            return;
        }
        const out = _buffer.Buffer.from(data, lengthOrEnc);
        if (descriptor.append) {
            _reactNativeFs.default.appendFile(descriptor.path, out.toString("base64"), "base64").then(()=>{
                descriptor.position += out.byteLength;
                posOrCB(null, out.byteLength, out.toString());
            }).catch(posOrCB);
            return;
        }
        _reactNativeFs.default.write(descriptor.path, out.toString("base64"), offsetOrPos, "base64").then(()=>{
            descriptor.position += out.byteLength;
            posOrCB(null, out.byteLength, out.toString());
        }).catch(posOrCB);
        return;
    }
    if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.writable)) {
        setImmediate(()=>callback(_err.default.EBADF())
        );
        return;
    }
    const out = _buffer.Buffer.from(data.buffer, offsetOrPos, lengthOrEnc);
    if (descriptor.append) {
        _reactNativeFs.default.appendFile(descriptor.path, out.toString("base64"), "base64").then(()=>{
            descriptor.position += out.byteLength;
            callback === null || callback === void 0 ? void 0 : callback(null, out.byteLength, out);
        }).catch(callback);
        return;
    }
    _reactNativeFs.default.write(descriptor.path, out.toString("base64"), posOrCB, "base64").then(()=>{
        descriptor.position += out.byteLength;
        callback === null || callback === void 0 ? void 0 : callback(null, out.byteLength, out);
    }).catch(callback);
}
writeImpl.__promisify__ = (fd, data, offsetOrPos, lengthOrEnc, pos)=>{
    return new Promise((resolve, reject)=>writeImpl(fd, data, offsetOrPos, lengthOrEnc, pos, (err, bytesWritten, buffer)=>{
            if (err) {
                return reject(err);
            }
            resolve({
                bytesWritten,
                buffer
            });
        })
    );
};
const write = writeImpl;
exports.write = write;
const writev = (fd, buffers, position, callback)=>{
    const descriptor = (0, _fd).getFD(fd);
    if (typeof position === "function") {
        return writev(fd, buffers, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, position);
    }
    if (typeof position !== "number") {
        return writev(fd, buffers, (descriptor === null || descriptor === void 0 ? void 0 : descriptor.position) || 0, callback);
    }
    checkCallback(callback);
    if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.writable)) {
        return setImmediate(()=>{
            var ref;
            return (ref = callback) === null || ref === void 0 ? void 0 : ref(_err.default.EBADF());
        });
    }
    if (descriptor.append) {
        (async ()=>{
            let err;
            let bytesWritten = 0;
            const bufs = [];
            for (let buf of buffers){
                const data = _buffer.Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
                try {
                    await _reactNativeFs.default.appendFile(descriptor.path, data.toString("base64"), "base64");
                } catch (e) {
                    err = e;
                    break;
                }
                bufs.push(data);
                bytesWritten += data.byteLength;
                descriptor.position += data.byteLength;
            }
            if (err) {
                var ref;
                (ref = callback) === null || ref === void 0 ? void 0 : ref(err);
            } else {
                callback === null || callback === void 0 ? void 0 : callback(null, bytesWritten, bufs);
            }
        })();
        return;
    }
    (async ()=>{
        let err;
        let bytesWritten = 0;
        const bufs = [];
        for (let buf of buffers){
            const data = _buffer.Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
            try {
                await _reactNativeFs.default.write(descriptor.path, data.toString("base64"), position, "base64");
            } catch (e) {
                err = e;
                break;
            }
            position += data.byteLength;
            bufs.push(data);
            bytesWritten += data.byteLength;
            descriptor.position = position;
        }
        if (err) {
            var ref;
            (ref = callback) === null || ref === void 0 ? void 0 : ref(err);
        } else {
            callback === null || callback === void 0 ? void 0 : callback(null, bytesWritten, bufs);
        }
    })();
    return;
};
exports.writev = writev;
writev.__promisify__ = (fd, buffers1, position)=>new Promise((resolve, reject)=>writev(fd, buffers1, position, (err, bytesWritten, buffers)=>{
            if (err) {
                return reject(err);
            }
            resolve({
                bytesWritten,
                buffers
            });
        })
    )
;
const createWriteStream = (path, options)=>{
    const fd = typeof options === "object" ? options.fd ? options.fd : null : null;
    const descriptor = fd ? (0, _fd).getFD(fd) : undefined;
    const file = descriptor ? descriptor.path : path.toString();
    const flags = typeof options === "object" ? (0, _filesystemConstants).parse(_filesystemConstants.linux, options.flags || "w") : (0, _filesystemConstants).parse(_filesystemConstants.linux, "w");
    const opts = {
        path: file,
        append: descriptor ? descriptor.append : (flags & _filesystemConstants.linux.O_APPEND) === _filesystemConstants.linux.O_APPEND,
        encoding: typeof options === "string" ? options : (options === null || options === void 0 ? void 0 : options.encoding) || "utf8",
        autoClose: typeof options === "object" ? options.autoClose || true : true,
        emitClose: typeof options === "object" ? options.emitClose || true : true,
        position: typeof options === "object" ? options.start || (descriptor ? descriptor.position : 0) : 0
    };
    let bytesWritten = 0;
    const stream = new _readableStream.Writable({
        defaultEncoding: opts.encoding,
        emitClose: opts.emitClose,
        final: (callback)=>{
            if (opts.autoClose) {
                try {
                    fd && (0, _fd).closeFD(fd);
                } catch (err) {
                    return callback(err);
                }
            }
            callback();
        },
        write: (chunk, encoding, callback)=>{
            let data;
            if (typeof chunk === "string") {
                data = _buffer.Buffer.from(chunk, encoding);
            } else if (chunk instanceof Uint8Array) {
                data = _buffer.Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
            } else {
                data = _buffer.Buffer.from(chunk);
            }
            if (opts.append) {
                _reactNativeFs.default.appendFile(opts.path, data === null || data === void 0 ? void 0 : data.toString("base64"), "base64").then(()=>{
                    bytesWritten += data.byteLength;
                    callback();
                }).catch((err)=>stream.destroy(err)
                );
            } else {
                _reactNativeFs.default.write(opts.path, data === null || data === void 0 ? void 0 : data.toString("base64"), opts.position, "base64").then(()=>{
                    bytesWritten += data.byteLength;
                    opts.position += data.byteLength;
                    callback();
                }).catch((err)=>stream.destroy(err)
                );
            }
        }
    });
    stream.close = ()=>{
        try {
            fd && (0, _fd).closeFD(fd);
        } catch (err) {
            stream.destroy(err);
        }
    };
    stream.bytesWritten = bytesWritten;
    stream.path = opts.path;
    stream.pending = false;
    if (descriptor && !descriptor.writable) {
        stream.destroy(_err.default.EBADF());
    }
    return stream;
};
exports.createWriteStream = createWriteStream;
const createReadStream = (path, options)=>{
    const fd = typeof options === "object" ? options.fd ? options.fd : null : null;
    const descriptor = fd ? (0, _fd).getFD(fd) : undefined;
    const file = descriptor ? descriptor.path : path.toString();
    const opts = {
        path: file,
        encoding: typeof options === "string" ? options : (options === null || options === void 0 ? void 0 : options.encoding) || undefined,
        autoClose: typeof options === "object" ? options.autoClose || true : true,
        emitClose: typeof options === "object" ? options.emitClose || true : true,
        position: typeof options === "object" ? options.start || (descriptor ? descriptor.position : 0) : 0,
        end: typeof options === "object" ? options.end || -1 : -1
    };
    let bytesRead = 0;
    const stream = new _readableStream.Readable({
        emitClose: opts.emitClose,
        encoding: opts.encoding,
        highWaterMark: 64 * 1024,
        read: (size)=>{
            _reactNativeFs.default.read(opts.path, size, opts.position, "base64").then((val)=>{
                const buffer = _buffer.Buffer.from(val, "base64");
                if (opts.end >= 0 && opts.position + buffer.byteLength > opts.end) {
                    stream.push(buffer.slice(0, opts.end - opts.position));
                    stream.push(null);
                } else {
                    stream.push(buffer);
                    if (!buffer.length) {
                        stream.push(null);
                    }
                }
                opts.position += buffer.byteLength;
                bytesRead += buffer.byteLength;
            }).catch((err)=>stream.destroy(err)
            );
        },
        destroy: (err, callback)=>{
            if (opts.autoClose) {
                try {
                    fd && (0, _fd).closeFD(fd);
                } catch (err2) {
                    return callback(err2);
                }
            }
            callback(err);
        }
    });
    stream.close = ()=>{
        try {
            fd && (0, _fd).closeFD(fd);
        } catch (err) {
            stream.destroy(err);
        }
    };
    stream.bytesRead = bytesRead;
    stream.path = opts.path;
    stream.pending = false;
    if (descriptor && !descriptor.readable) {
        stream.destroy(_err.default.EBADF());
    }
    return stream;
};
exports.createReadStream = createReadStream;
const read = (fd, buffer, offset, length, position, callback)=>{
    if (typeof buffer === "function") {
        return read(fd, _buffer.Buffer.alloc(16 * 1024), 0, 16 * 1024, null, buffer);
    }
    if (!(buffer instanceof Uint8Array) && typeof offset === "function") {
        var ref;
        return read(fd, buffer.buffer || _buffer.Buffer.alloc(16 * 1024), buffer.offset || 0, buffer.length || ((ref = buffer.buffer) === null || ref === void 0 ? void 0 : ref.byteLength) || 16 * 1024, buffer.position || null, offset);
    }
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.readable)) {
        return setImmediate(()=>{
            var ref;
            return (ref = callback) === null || ref === void 0 ? void 0 : ref(_err.default.EBADF());
        });
    }
    _reactNativeFs.default.read(descriptor.path, length, typeof position === "number" ? position : descriptor.position, "base64").then((data)=>{
        const buf = _buffer.Buffer.from(data, "base64");
        buf.copy(buffer, offset, 0, length);
        if (!position) {
            descriptor.position += buf.byteLength;
        }
        callback === null || callback === void 0 ? void 0 : callback(null, buf.byteLength, buffer);
    }).catch(callback);
};
exports.read = read;
read.__promisify__ = (fd, buffer1, offset, length, position)=>new Promise((resolve, reject)=>{
        if (typeof buffer1 === "undefined") {
            return read(fd, (err, bytesRead, buffer)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesRead,
                    buffer
                });
            });
        }
        if (buffer1 && typeof offset === "undefined") {
            return read(fd, buffer1, (err, bytesRead, buffer)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesRead,
                    buffer
                });
            });
        }
        read(fd, buffer1, offset, length, position, (err, bytesRead, buffer)=>{
            if (err) {
                return reject(err);
            }
            resolve({
                bytesRead,
                buffer
            });
        });
    })
;
const readv = (fd, buffers, position, callback)=>{
    if (typeof position === "function") {
        return readv(fd, buffers, null, position);
    }
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.readable)) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    let current = typeof position === "number" ? position : descriptor.position;
    let bytesRead = 0;
    (async ()=>{
        let err;
        for (let buffer of buffers){
            try {
                const buf = _buffer.Buffer.from(await _reactNativeFs.default.read(descriptor.path, buffer.byteLength, current, "base64"), "base64");
                if (!buf.byteLength) {
                    break;
                }
                buf.copy(buffer);
                current += buf.byteLength;
                bytesRead += buf.byteLength;
                if (typeof position !== "number") {
                    descriptor.position += buf.byteLength;
                }
            } catch (e) {
                err = e;
                break;
            }
        }
        if (err) {
            callback(err);
        } else {
            callback === null || callback === void 0 ? void 0 : callback(null, bytesRead, buffers);
        }
    })();
};
exports.readv = readv;
readv.__promisify__ = (fd, buffers2, position)=>new Promise((resolve, reject)=>readv(fd, buffers2, position, (err, bytesRead, buffers)=>{
            if (err) {
                return reject(err);
            }
            resolve({
                bytesRead,
                buffers
            });
        })
    )
;
const readFile = (path, options, callback)=>{
    if (typeof options === "function") {
        return readFile(path, {
            encoding: null
        }, options);
    }
    if (typeof options === "string") {
        return readFile(path, {
            encoding: options
        }, callback);
    }
    if (typeof options === "undefined") {
        return readFile(path, {
            encoding: null
        }, callback);
    }
    checkCallback(callback);
    if (typeof path === "number") {
        const fd = (0, _fd).getFD(path);
        if (!(fd === null || fd === void 0 ? void 0 : fd.readable)) {
            return setImmediate(()=>callback(_err.default.EBADF())
            );
        }
        _reactNativeFs.default.read(fd.path, fd.size, fd.position, "base64").then((data)=>{
            const buf = _buffer.Buffer.from(data, "base64");
            fd.position += buf.byteLength;
            callback === null || callback === void 0 ? void 0 : callback(null, (options === null || options === void 0 ? void 0 : options.encoding) ? buf.toString(options.encoding) : buf);
        }).catch(callback);
        return;
    }
    _reactNativeFs.default.readFile(path.toString(), "base64").then((data)=>{
        const buf = _buffer.Buffer.from(data, "base64");
        callback === null || callback === void 0 ? void 0 : callback(null, options.encoding ? buf.toString(options.encoding) : buf);
    }).catch(callback);
};
exports.readFile = readFile;
readFile.__promisify__ = (path, options)=>new Promise((resolve, reject)=>readFile(path, options, (err, data)=>{
            if (err) {
                return reject(err);
            }
            resolve(data);
        })
    )
;
const close = (fd, callback)=>{
    try {
        (0, _fd).closeFD(fd);
    } catch (err) {
        return callback === null || callback === void 0 ? void 0 : callback(err);
    }
    callback === null || callback === void 0 ? void 0 : callback(null);
};
exports.close = close;
close.__promisify__ = (fd)=>new Promise((resolve, reject)=>close(fd, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const copyFile = (src, dest, mode, callback)=>{
    if (typeof mode === "function") {
        return copyFile(src, dest, 0, mode);
    }
    checkCallback(callback);
    const exclusive = (mode & _filesystemConstants.linux.COPYFILE_EXCL) === _filesystemConstants.linux.COPYFILE_EXCL;
    _reactNativeFs.default.stat(dest.toString()).then((stat1)=>{
        if (stat1.isDirectory()) {
            throw _err.default.EISDIR(dest.toString());
        }
        if (exclusive) {
            throw _err.default.EEXIST(dest.toString());
        }
        return _reactNativeFs.default.copyFile(src.toString(), dest.toString());
    }).catch((err)=>{
        if (err.message === "File does not exist") {
            return _reactNativeFs.default.copyFile(src.toString(), dest.toString());
        }
        if (err.code === "EUNSPECIFIED") {
            throw _err.default.EISDIR(src.toString());
        }
        throw err;
    }).then(()=>callback(null)
    ).catch(callback);
};
exports.copyFile = copyFile;
copyFile.__promisify__ = (src, dest, mode)=>new Promise((resolve, reject)=>copyFile(src, dest, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const cp = (src1, dest1, options, callback)=>{
    if (typeof options === "function") {
        return cp(src1, dest1, {}, options);
    }
    checkCallback(callback);
    const opts = Object.assign({
        errorOnExist: false,
        force: true,
        recursive: false
    }, options);
    const copy = async (src, dest)=>{
        const sstat = await _reactNativeFs.default.stat(src).catch(()=>null
        );
        const dstat = await _reactNativeFs.default.stat(dest).catch(()=>null
        );
        if (!sstat) {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(src));
        }
        if (opts.errorOnExist && dstat) {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.EEXIST(dest));
        }
        if (!opts.force && dstat) {
            return;
        }
        if (sstat.isDirectory()) {
            try {
                await _reactNativeFs.default.mkdir((0, _path).join(dest, (0, _path).basename(src)));
            } catch (err) {
                return callback === null || callback === void 0 ? void 0 : callback(err);
            }
            if (!opts.recursive) {
                return;
            }
            return _reactNativeFs.default.readDir(src).then((items)=>Promise.all(items.map((i)=>copy(i.path, (0, _path).join(dest, i.name))
                )).then()
            );
        }
        try {
            return _reactNativeFs.default.copyFile(src, dest);
        } catch (err) {
            return callback === null || callback === void 0 ? void 0 : callback(err);
        }
    };
    (async ()=>{
        const sstat = await _reactNativeFs.default.stat(src1).catch(()=>null
        );
        const dstat = await _reactNativeFs.default.stat(dest1).catch(()=>null
        );
        if (!sstat) {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(src1));
        }
        if (opts.errorOnExist && dstat) {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.EEXIST(dest1));
        }
        if (!opts.force && dstat) {
            return;
        }
        if (sstat.isDirectory()) {
            try {
                await _reactNativeFs.default.mkdir(dest1);
            } catch (err1) {
                return callback === null || callback === void 0 ? void 0 : callback(err1);
            }
            return _reactNativeFs.default.readDir(src1).then((items)=>Promise.all(items.map((i)=>copy(i.path, (0, _path).join(dest1, i.name))
                ))
            ).then(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(null);
            }).catch((err)=>{
                return callback === null || callback === void 0 ? void 0 : callback(err);
            });
        }
        _reactNativeFs.default.copyFile(src1, dest1).then(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    })();
};
exports.cp = cp;
const mkdir = (path, options, callback)=>{
    if (typeof options === "function") {
        return mkdir(path, {}, options);
    }
    checkCallback(callback);
    const opts = Object.assign({
        recursive: false
    }, options);
    if (opts.recursive) {
        _reactNativeFs.default.mkdir(path.toString()).then(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    } else {
        (async ()=>{
            let exists1 = await _reactNativeFs.default.exists(path.toString());
            if (exists1) {
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.EEXIST(path.toString()));
            }
            exists1 = await _reactNativeFs.default.exists((0, _path).dirname(path.toString()));
            if (!exists1) {
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(path.toString()));
            }
            await _reactNativeFs.default.mkdir(path.toString()).then(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(null);
            }).catch(callback);
        })();
    }
};
exports.mkdir = mkdir;
mkdir.__promisify__ = (path1, options)=>new Promise((resolve, reject)=>mkdir(path1, options, (err, path)=>{
            if (err) {
                return reject(err);
            }
            resolve(path);
        })
    )
;
const mkdtemp = (prefix, options, callback)=>{
    if (typeof options === "function") {
        return mkdtemp(prefix, {
            encoding: "utf8"
        }, options);
    }
    if (typeof options === "string") {
        return mkdtemp(prefix, {
            encoding: options
        }, callback);
    }
    if (typeof options === "undefined") {
        return mkdtemp(prefix, {
            encoding: "utf8"
        }, callback);
    }
    checkCallback(callback);
    const dir = (0, _path).join(_reactNativeFs.default.TemporaryDirectoryPath, ((options === null || options === void 0 ? void 0 : options.encoding) ? options.encoding === "buffer" ? _buffer.Buffer.from(prefix).toString() : _buffer.Buffer.from(prefix, options.encoding) : prefix) + (0, _nonSecure).nanoid(6));
    _reactNativeFs.default.mkdir(dir).then(()=>{
        return callback === null || callback === void 0 ? void 0 : callback(null, dir);
    }).catch(callback);
};
exports.mkdtemp = mkdtemp;
mkdtemp.__promisify__ = (prefix, options)=>new Promise((resolve, reject)=>mkdtemp(prefix, options, (err, dir)=>{
            if (err) {
                return reject(err);
            }
            resolve(dir);
        })
    )
;
const opendir = (path, options, callback)=>{
    if (typeof options === "function") {
        return opendir(path, {
            encoding: "utf8"
        }, options);
    }
    if (typeof options === "string") {
        return opendir(path, {
            encoding: options
        }, callback);
    }
    if (typeof options === "undefined") {
        return opendir(path, {
            encoding: "utf8"
        }, callback);
    }
    checkCallback(callback);
    setImmediate(()=>{
        return callback === null || callback === void 0 ? void 0 : callback(null, new _common.Dir(path, options.encoding));
    });
};
exports.opendir = opendir;
opendir.__promisify__ = (path, options)=>new Promise((resolve, reject)=>opendir(path, options, (err, dir)=>{
            if (err) {
                return reject(err);
            }
            resolve(dir);
        })
    )
;
function readdirImpl(path, options, callback) {
    if (typeof options === "function") {
        return readdirImpl(path, {
            encoding: "utf8"
        }, options);
    }
    if (typeof options === "string") {
        return readdirImpl(path, {
            encoding: options
        }, callback);
    }
    if (typeof options === "undefined") {
        return readdirImpl(path, {
            encoding: "utf8"
        }, callback);
    }
    checkCallback(callback);
    const dir = (options === null || options === void 0 ? void 0 : options.encoding) === "buffer" ? path.toString() : _buffer.Buffer.from(path.toString(), (options === null || options === void 0 ? void 0 : options.encoding) || "utf8").toString();
    if (options === null || options === void 0 ? void 0 : options.withFileTypes) {
        _reactNativeFs.default.readDir(dir).then((items)=>{
            return callback === null || callback === void 0 ? void 0 : callback(null, items.map((i)=>new _common.Dirent(i)
            ));
        }).catch(callback);
        return;
    }
    _reactNativeFs.default.readdir(dir).then((items)=>{
        if ((options === null || options === void 0 ? void 0 : options.encoding) === "buffer") {
            callback === null || callback === void 0 ? void 0 : callback(null, items.map((i)=>_buffer.Buffer.from(i)
            ));
        } else {
            callback === null || callback === void 0 ? void 0 : callback(null, items);
        }
    }).catch(callback);
}
readdirImpl.__promisify__ = (path, options)=>new Promise((resolve, reject)=>readdirImpl(path, options, (err, files)=>{
            if (err) {
                return reject(err);
            }
            resolve(files);
        })
    )
;
const readdir = readdirImpl;
exports.readdir = readdir;
const rmdir = (path, options, callback)=>{
    if (typeof options === "function") {
        return rmdir(path, {}, options);
    }
    if (typeof options === "undefined") {
        return rmdir(path, {}, callback);
    }
    checkCallback(callback);
    _reactNativeFs.default.readdir(path.toString()).then((items)=>{
        if (!items.length || options.recursive) {
            return _reactNativeFs.default.unlink(path.toString()).then(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(null);
            }).catch(callback);
        }
        throw _err.default.ENOTEMPTY(path.toString());
    }).catch((err)=>{
        if (err.message === "Attempt to get length of null array") {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOTDIR(path.toString()));
        }
        if (err.message === "Folder does not exist") {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(path.toString()));
        }
        callback === null || callback === void 0 ? void 0 : callback(err);
    });
};
exports.rmdir = rmdir;
rmdir.__promisify__ = (path, options)=>new Promise((resolve, reject)=>rmdir(path, options, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const unlink = (path, callback)=>{
    checkCallback(callback);
    _reactNativeFs.default.stat(path.toString()).then((stat2)=>{
        if (stat2.isDirectory()) {
            return callback(_err.default.EISDIR(path.toString()));
        }
        return _reactNativeFs.default.unlink(path.toString()).then(()=>callback(null)
        );
    }).catch((err)=>{
        if (err.message === "File does not exist") {
            return callback(_err.default.ENOENT(path.toString()));
        }
        callback(err);
    });
};
exports.unlink = unlink;
unlink.__promisify__ = (path)=>new Promise((resolve, reject)=>unlink(path, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const rm = (path, options, callback)=>{
    if (typeof options === "function") {
        return rm(path, {}, options);
    }
    checkCallback(callback);
    (async ()=>{
        const stat3 = await _reactNativeFs.default.stat(path.toString()).catch((err)=>err
        );
        if (stat3 instanceof Error) {
            if (stat3.message === "File does not exist" && (options === null || options === void 0 ? void 0 : options.force)) {
                return callback === null || callback === void 0 ? void 0 : callback(null);
            }
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(path.toString()));
        }
        if (stat3.isDirectory()) {
            const items = await _reactNativeFs.default.readdir(path.toString()).catch();
            if (items === null || items === void 0 ? void 0 : items.length) {
                if (options === null || options === void 0 ? void 0 : options.recursive) {
                    return _reactNativeFs.default.unlink(path.toString()).then(()=>{
                        return callback === null || callback === void 0 ? void 0 : callback(null);
                    }).catch(callback);
                }
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOTEMPTY(path.toString()));
            }
        }
        return _reactNativeFs.default.unlink(path.toString()).then(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(null);
        }).catch(callback);
    })();
};
exports.rm = rm;
rm.__promisify__ = (path, options)=>new Promise((resolve, reject)=>rm(path, options, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const truncate = (path, len, callback)=>{
    if (typeof len === "function") {
        return truncate(path, 0, len);
    }
    checkCallback(callback);
    if (typeof path === "number") {
        const descriptor = (0, _fd).getFD(path);
        if (!descriptor) {
            return setImmediate(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(_err.default.EBADF());
            });
        }
        path = descriptor.path;
    }
    if (len) {
        (async ()=>{
            const data = await _reactNativeFs.default.read(path.toString(), len, 0, "base64") || _buffer.Buffer.alloc(len).toString("base64");
            return _reactNativeFs.default.writeFile(path.toString(), data, "base64").then(()=>{
                return callback === null || callback === void 0 ? void 0 : callback(null);
            }).catch(callback);
        })();
        return;
    }
    _reactNativeFs.default.writeFile(path.toString(), "").then(()=>{
        return callback === null || callback === void 0 ? void 0 : callback(null);
    }).catch(callback);
};
exports.truncate = truncate;
truncate.__promisify__ = (path, len)=>new Promise((resolve, reject)=>truncate(path, len, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const stat = (path, options, callback)=>{
    if (typeof options === "function") {
        return stat(path, {}, options);
    }
    checkCallback(callback);
    _reactNativeFs.default.stat(path.toString()).then((stats)=>{
        return callback === null || callback === void 0 ? void 0 : callback(null, new _common.Stats(stats));
    }).catch((err)=>{
        var ref;
        if (err.message === "File does not exist") {
            var ref1;
            return (ref1 = callback) === null || ref1 === void 0 ? void 0 : ref1(_err.default.ENOENT(path.toString()));
        }
        return (ref = callback) === null || ref === void 0 ? void 0 : ref(err);
    });
};
exports.stat = stat;
stat.__promisify__ = (path, options)=>new Promise((resolve, reject)=>stat(path, options, (err, stats)=>{
            if (err) {
                return reject(err);
            }
            resolve(stats);
        })
    )
;
const utimes = (path, atime, mtime, callback)=>{
    let time;
    if (mtime instanceof Date) {
        time = mtime;
    } else if (typeof mtime === "number") {
        time = new Date(mtime);
    } else if (typeof mtime === "string") {
        time = new Date(parseInt(mtime));
    } else {
        throw new Error("InvalidArgument");
    }
    checkCallback(callback);
    _reactNativeFs.default.touch(path.toString(), time).then(()=>{
        return callback === null || callback === void 0 ? void 0 : callback(null);
    }).catch(callback);
};
exports.utimes = utimes;
utimes.__promisify__ = (path, atime, mtime)=>new Promise((resolve, reject)=>utimes(path, atime, mtime, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const access = (path, mode, callback)=>{
    if (typeof mode === "function") {
        return access(path, _filesystemConstants.linux.F_OK, mode);
    }
    checkCallback(callback);
    _reactNativeFs.default.exists(path.toString()).then((e)=>{
        if (!e) {
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.ENOENT(path.toString()));
        }
        return callback === null || callback === void 0 ? void 0 : callback(null);
    }).catch(callback);
};
exports.access = access;
access.__promisify__ = (path, mode)=>new Promise((resolve, reject)=>access(path, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const chmod = (path, mode, callback)=>{
    checkCallback(callback);
    _reactNativeFs.default.exists(path.toString()).then((e)=>{
        if (!e) {
            return callback(_err.default.ENOENT(path.toString()));
        }
        return callback(null);
    }).catch(callback);
};
exports.chmod = chmod;
chmod.__promisify__ = (path, mode)=>new Promise((resolve, reject)=>chmod(path, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const chown = (path, uid, gid, callback)=>{
    checkCallback(callback);
    _reactNativeFs.default.exists(path.toString()).then((e)=>{
        if (!e) {
            return callback(_err.default.ENOENT(path.toString()));
        }
        return callback(null);
    }).catch(callback);
};
exports.chown = chown;
chown.__promisify__ = (path, uid, gid)=>new Promise((resolve, reject)=>chown(path, uid, gid, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const exists = (path, callback)=>{
    checkCallback(callback);
    _reactNativeFs.default.exists(path.toString()).then(callback).catch(()=>callback(false)
    );
};
exports.exists = exists;
exists.__promisify__ = (path)=>new Promise((resolve)=>exists(path, resolve)
    )
;
const link = (existingPath, newPath, callback)=>{
    checkCallback(callback);
    setImmediate(()=>callback(_common.NotImplemented)
    );
};
exports.link = link;
link.__promisify__ = (existingPath, newPath)=>new Promise((resolve, reject)=>link(existingPath, newPath, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const readlink = (path, options, callback)=>{
    if (typeof options === "function") {
        return readlink(path, {}, options);
    }
    checkCallback(callback);
    setImmediate(()=>callback(_common.NotImplemented)
    );
};
exports.readlink = readlink;
readlink.__promisify__ = (path, options)=>new Promise((resolve, reject)=>readlink(path, options, (err, link1)=>{
            if (err) {
                return reject(err);
            }
            resolve(link1);
        })
    )
;
const realpath = (path, options, callback)=>{
    if (typeof options === "function") {
        return realpath(path, {}, options);
    }
    checkCallback(callback);
    const buffer = typeof options === "string" ? options === "buffer" : (options === null || options === void 0 ? void 0 : options.encoding) === "buffer";
    _reactNativeFs.default.stat(path.toString()).then((stat4)=>{
        return callback === null || callback === void 0 ? void 0 : callback(null, buffer ? _buffer.Buffer.from(stat4.originalFilepath) : stat4.originalFilepath);
    }).catch((err)=>{
        var ref;
        if (err.message === "File does not exist") {
            var ref2;
            return (ref2 = callback) === null || ref2 === void 0 ? void 0 : ref2(_err.default.ENOENT(path.toString()));
        }
        return (ref = callback) === null || ref === void 0 ? void 0 : ref(err);
    });
};
exports.realpath = realpath;
realpath.__promisify__ = (path2, options)=>new Promise((resolve, reject)=>realpath(path2, options, (err, path)=>{
            if (err) {
                return reject(err);
            }
            resolve(path);
        })
    )
;
realpath.native = realpath;
const rename = (oldPath, newPath, callback)=>{
    checkCallback(callback);
    _reactNativeFs.default.stat(newPath.toString()).catch(()=>{}).then((stat5)=>{
        if (stat5 === null || stat5 === void 0 ? void 0 : stat5.isDirectory()) {
            throw _err.default.EISDIR(newPath.toString());
        }
        return _reactNativeFs.default.moveFile(oldPath.toString(), newPath.toString());
    }).then(()=>callback(null)
    ).catch((err)=>{
        callback(err);
    });
};
exports.rename = rename;
rename.__promisify__ = (oldPath, newPath)=>new Promise((resolve, reject)=>rename(oldPath, newPath, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const symlink = (target, path, type, callback)=>{
    if (typeof type === "function") {
        return symlink(target, path, undefined, type);
    }
    checkCallback(callback);
    setImmediate(()=>{
        return callback === null || callback === void 0 ? void 0 : callback(_common.NotImplemented);
    });
};
exports.symlink = symlink;
symlink.__promisify__ = (target, path, type)=>new Promise((resolve, reject)=>symlink(target, path, type, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const watch = ()=>{
    throw _common.NotImplemented;
};
exports.watch = watch;
const watchFile = ()=>{
    throw _common.NotImplemented;
};
exports.watchFile = watchFile;
const unwatchFile = ()=>{
    throw _common.NotImplemented;
};
exports.unwatchFile = unwatchFile;
const fchmod = (fd, mode, callback)=>{
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    return chmod(descriptor.path, mode, callback);
};
exports.fchmod = fchmod;
fchmod.__promisify__ = (fd, mode)=>new Promise((resolve, reject)=>fchmod(fd, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const fchown = (fd, uid, gid, callback)=>{
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    return chown(descriptor.path, uid, gid, callback);
};
exports.fchown = fchown;
fchown.__promisify__ = (fd, uid, gid)=>new Promise((resolve, reject)=>fchown(fd, uid, gid, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const fdatasync = (fd, callback)=>{
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    setImmediate(()=>callback(null)
    );
};
exports.fdatasync = fdatasync;
fdatasync.__promisify__ = ()=>Promise.resolve()
;
const fsync = (fd, callback)=>{
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    setImmediate(()=>callback(null)
    );
};
exports.fsync = fsync;
fsync.__promisify__ = ()=>Promise.resolve()
;
const fstat = (fd, options, callback)=>{
    if (typeof options === "function") {
        return fstat(fd, {}, options);
    }
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.EBADF());
        });
    }
    return stat(descriptor.path, options, callback);
};
exports.fstat = fstat;
fstat.__promisify__ = (fd, options)=>new Promise((resolve, reject)=>fstat(fd, options, (err, stats)=>{
            if (err) {
                return reject(err);
            }
            resolve(stats);
        })
    )
;
const ftruncate = (fd, len, callback)=>{
    if (typeof len === "function") {
        return ftruncate(fd, 0, len);
    }
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>{
            return callback === null || callback === void 0 ? void 0 : callback(_err.default.EBADF());
        });
    }
    return truncate(descriptor.path, len, callback);
};
exports.ftruncate = ftruncate;
ftruncate.__promisify__ = (fd, len)=>new Promise((resolve, reject)=>ftruncate(fd, len, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const futimes = (fd, atime, mtime, callback)=>{
    checkCallback(callback);
    const descriptor = (0, _fd).getFD(fd);
    if (!descriptor) {
        return setImmediate(()=>callback(_err.default.EBADF())
        );
    }
    return utimes(descriptor.path, atime, mtime, callback);
};
exports.futimes = futimes;
futimes.__promisify__ = (fd, atime, mtime)=>new Promise((resolve, reject)=>futimes(fd, atime, mtime, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
const lchmod = ()=>{
    throw _common.NotImplemented;
};
exports.lchmod = lchmod;
lchmod.__promisify__ = ()=>Promise.reject(_common.NotImplemented)
;
const lchown = ()=>{
    throw _common.NotImplemented;
};
exports.lchown = lchown;
lchown.__promisify__ = ()=>Promise.reject(_common.NotImplemented)
;
const lutimes = ()=>{
    throw _common.NotImplemented;
};
exports.lutimes = lutimes;
lutimes.__promisify__ = ()=>Promise.reject(_common.NotImplemented)
;
const lstat = ()=>{
    throw _common.NotImplemented;
};
exports.lstat = lstat;
lstat.__promisify__ = ()=>Promise.reject(_common.NotImplemented)
;
