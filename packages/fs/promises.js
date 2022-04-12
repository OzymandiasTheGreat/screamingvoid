"use strict";
exports.writeFile = exports.watch = exports.utimes = exports.unlink = exports.truncate = exports.symlink = exports.stat = exports.rm = exports.rmdir = exports.rename = exports.realpath = exports.readlink = exports.readFile = exports.readdir = exports.opendir = exports.mkdtemp = exports.mkdir = exports.lstat = exports.link = exports.lutimes = exports.lchown = exports.lchmod = exports.cp = exports.copyFile = exports.chown = exports.chmod = exports.appendFile = exports.access = exports.open = void 0;
var _filesystemConstants = require("filesystem-constants");
var impl = _interopRequireWildcard(require("./"));
var _fd = require("./fd");
var _err = _interopRequireDefault(require("./err"));
var _common = require("./common");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
class FileHandle {
    get fd() {
        return this._fd;
    }
    appendFile(data, options) {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        if (options) {
            return new Promise((resolve, reject)=>impl.appendFile(fd.path, data, options, (err)=>{
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                })
            );
        }
        return new Promise((resolve, reject)=>impl.appendFile(fd.path, data, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        );
    }
    chmod(mode) {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return Promise.resolve();
    }
    chown(uid, gid) {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return Promise.resolve();
    }
    close() {
        return new Promise((resolve, reject)=>{
            try {
                (0, _fd).closeFD(this.fd);
                this._fd = -1;
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
    createReadStream(options) {
        return impl.createReadStream("", Object.assign({}, options, {
            fd: this.fd
        }));
    }
    createWriteStream(options) {
        return impl.createWriteStream("", Object.assign({}, options, {
            fd: this.fd
        }));
    }
    datasync() {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return Promise.resolve();
    }
    sync() {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return Promise.resolve();
    }
    read(buffer1, offset, length, position) {
        return new Promise((resolve, reject)=>{
            if (buffer1 instanceof Uint8Array) {
                return impl.read(this.fd, buffer1, offset, length, position, (err, bytesRead, buffer)=>{
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        bytesRead,
                        buffer: buffer
                    });
                });
            }
            impl.read(this.fd, buffer1, (err, bytesRead, buffer)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesRead,
                    buffer: buffer
                });
            });
        });
    }
    readFile(options) {
        return new Promise((resolve, reject)=>impl.readFile(this.fd, options, (err, data)=>{
                if (err) {
                    return reject(err);
                }
                resolve(data);
            })
        );
    }
    readv(buffers1, position) {
        return new Promise((resolve, reject)=>impl.readv(this.fd, buffers1, position, (err, bytesRead, buffers)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesRead,
                    buffers
                });
            })
        );
    }
    stat(opts) {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return new Promise((resolve, reject)=>impl.stat(fd.path, (err, stats)=>{
                if (err) {
                    return reject(err);
                }
                resolve(stats);
            })
        );
    }
    truncate(len) {
        return new Promise((resolve, reject)=>impl.truncate(this.fd, len, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        );
    }
    utimes(atime, mtime) {
        const fd = (0, _fd).getFD(this.fd);
        if (!fd) {
            return Promise.reject(_err.default.EBADF());
        }
        return new Promise((resolve, reject)=>impl.utimes(fd.path, atime, mtime, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        );
    }
    write(buffer2, offset, length, position) {
        return new Promise((resolve, reject)=>impl.write(this.fd, buffer2, offset, length, position, (err, bytesWritten, buffer)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesWritten,
                    buffer
                });
            })
        );
    }
    writeFile(data, options) {
        return new Promise((resolve, reject)=>impl.writeFile(this.fd, data, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        );
    }
    writev(buffers2, position) {
        return new Promise((resolve, reject)=>impl.writev(this.fd, buffers2, position, (err, bytesWritten, buffers)=>{
                if (err) {
                    return reject(err);
                }
                resolve({
                    bytesWritten,
                    buffers
                });
            })
        );
    }
    constructor(fd){
        this._fd = fd;
    }
}
const open = (path, flags, mode)=>{
    if (typeof flags !== "number") {
        flags = (0, _filesystemConstants).parse(_filesystemConstants.linux, flags);
    }
    return (0, _fd).openFD(path, flags).then((fd)=>new FileHandle(fd)
    );
};
exports.open = open;
const access = (path, mode)=>new Promise((resolve, reject)=>impl.access(path, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.access = access;
const appendFile = (path, data, options)=>new Promise((resolve, reject)=>{
        let pathOrFd;
        if (path instanceof FileHandle) {
            pathOrFd = path.fd;
        } else {
            pathOrFd = path;
        }
        if (options) {
            return impl.appendFile(pathOrFd, data, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.appendFile(pathOrFd, data, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.appendFile = appendFile;
const chmod = (path, mode)=>new Promise((resolve, reject)=>impl.chmod(path, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.chmod = chmod;
const chown = (path, uid, gid)=>new Promise((resolve, reject)=>impl.chown(path, uid, gid, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.chown = chown;
const copyFile = (src, dest, mode)=>new Promise((resolve, reject)=>{
        if (mode) {
            return impl.copyFile(src, dest, mode, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.copyFile(src, dest, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.copyFile = copyFile;
const cp = (src, dest, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.cp(src, dest, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.cp(src, dest, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.cp = cp;
const lchmod = (path, mode)=>new Promise((resolve, reject)=>impl.lchmod(path, mode, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.lchmod = lchmod;
const lchown = (path, uid, gid)=>new Promise((resolve, reject)=>impl.lchown(path, uid, gid, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.lchown = lchown;
const lutimes = (path, atime, mtime)=>new Promise((resolve, reject)=>impl.lutimes(path, atime, mtime, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.lutimes = lutimes;
const link = (existingPath, newPath)=>new Promise((resolve, reject)=>impl.link(existingPath, newPath, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.link = link;
const lstat = (path, options)=>new Promise((resolve, reject)=>impl.lstat(path, (err, stats)=>{
            if (err) {
                return reject(err);
            }
            resolve(stats);
        })
    )
;
exports.lstat = lstat;
const mkdir = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.mkdir(path, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.mkdir(path, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.mkdir = mkdir;
const mkdtemp = (prefix, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.mkdtemp(prefix, options, (err, folder)=>{
                if (err) {
                    return reject(err);
                }
                resolve(folder);
            });
        }
        impl.mkdtemp(prefix, (err, folder)=>{
            if (err) {
                return reject(err);
            }
            resolve(folder);
        });
    })
;
exports.mkdtemp = mkdtemp;
const opendir = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.opendir(path, options, (err, dir)=>{
                if (err) {
                    return reject(err);
                }
                resolve(dir);
            });
        }
        impl.opendir(path, (err, dir)=>{
            if (err) {
                return reject(err);
            }
            resolve(dir);
        });
    })
;
exports.opendir = opendir;
const readdir = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.readdir(path, options, (err, files)=>{
                if (err) {
                    return reject(err);
                }
                resolve(files);
            });
        }
        impl.readdir(path, (err, files)=>{
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    })
;
exports.readdir = readdir;
const readFile = (path, options)=>new Promise((resolve, reject)=>{
        let pathOrFd;
        if (path instanceof FileHandle) {
            pathOrFd = path.fd;
        } else {
            pathOrFd = path;
        }
        if (options) {
            return impl.readFile(pathOrFd, options, (err, content)=>{
                if (err) {
                    return reject(err);
                }
                resolve(content);
            });
        }
        impl.readFile(pathOrFd, (err, content)=>{
            if (err) {
                return reject(err);
            }
            resolve(content);
        });
    })
;
exports.readFile = readFile;
const readlink = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.readlink(path, options, (err, link1)=>{
                if (err) {
                    return reject(err);
                }
                resolve(link1);
            });
        }
        impl.readlink(path, (err, link2)=>{
            if (err) {
                return reject(err);
            }
            resolve(link2);
        });
    })
;
exports.readlink = readlink;
const realpath = (path1, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.realpath(path1, options, (err, path)=>{
                if (err) {
                    return reject(err);
                }
                resolve(path);
            });
        }
        impl.realpath(path1, (err, path)=>{
            if (err) {
                return reject(err);
            }
            resolve(path);
        });
    })
;
exports.realpath = realpath;
const rename = (oldPath, newPath)=>new Promise((resolve, reject)=>impl.rename(oldPath, newPath, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.rename = rename;
const rmdir = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.rmdir(path, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.rmdir(path, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.rmdir = rmdir;
const rm = (path, options)=>new Promise((resolve, reject)=>{
        if (options) {
            return impl.rm(path, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.rm(path, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.rm = rm;
const stat = (path, options)=>new Promise((resolve, reject)=>impl.stat(path, (err, stats)=>{
            if (err) {
                return reject(err);
            }
            resolve(stats);
        })
    )
;
exports.stat = stat;
const symlink = (target, path, type)=>new Promise((resolve, reject)=>impl.symlink(target, path, type, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.symlink = symlink;
const truncate = (path, len)=>new Promise((resolve, reject)=>impl.truncate(path, len, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.truncate = truncate;
const unlink = (path)=>new Promise((resolve, reject)=>impl.unlink(path, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.unlink = unlink;
const utimes = (path, atime, mtime)=>new Promise((resolve, reject)=>impl.utimes(path, atime, mtime, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        })
    )
;
exports.utimes = utimes;
const watch = (path, options)=>{
    throw _common.NotImplemented;
};
exports.watch = watch;
const writeFile = (path, data, options)=>new Promise((resolve, reject)=>{
        let pathOrFd;
        if (path instanceof FileHandle) {
            pathOrFd = path.fd;
        } else {
            pathOrFd = path;
        }
        if (options) {
            return impl.writeFile(pathOrFd, data, options, (err)=>{
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        impl.writeFile(pathOrFd, data, (err)=>{
            if (err) {
                return reject(err);
            }
            resolve();
        });
    })
;
exports.writeFile = writeFile;
