"use strict";
exports.getFD = exports.closeFD = exports.openFD = void 0;
var _filesystemConstants = require("filesystem-constants");
var _reactNativeFs = _interopRequireDefault(require("react-native-fs"));
var _err = _interopRequireDefault(require("./err"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const FDs = {};
const openFD = async (path, flags)=>{
    const stat = await _reactNativeFs.default.stat(path.toString()).catch(()=>null
    );
    if (stat === null || stat === void 0 ? void 0 : stat.isDirectory()) {
        throw _err.default.EISDIR(path.toString());
    }
    if (stat && (flags & _filesystemConstants.linux.O_EXCL) === _filesystemConstants.linux.O_EXCL) {
        throw _err.default.EEXIST(path.toString());
    }
    if (!stat && (flags & _filesystemConstants.linux.O_CREAT) !== _filesystemConstants.linux.O_CREAT) {
        throw _err.default.ENOENT(path.toString());
    }
    const readable = (flags & _filesystemConstants.linux.O_WRONLY) !== _filesystemConstants.linux.O_WRONLY || (flags & _filesystemConstants.linux.O_RDWR) === _filesystemConstants.linux.O_RDWR;
    const writable = (flags & _filesystemConstants.linux.O_WRONLY) === _filesystemConstants.linux.O_WRONLY || (flags & _filesystemConstants.linux.O_RDWR) === _filesystemConstants.linux.O_RDWR;
    const append = (flags & _filesystemConstants.linux.O_APPEND) === _filesystemConstants.linux.O_APPEND;
    const fd = {
        path: path.toString(),
        flags,
        position: append ? (stat === null || stat === void 0 ? void 0 : stat.size) || 0 : 0,
        readable,
        writable,
        append,
        size: (stat === null || stat === void 0 ? void 0 : stat.size) || 0
    };
    if (stat && (flags & _filesystemConstants.linux.O_TRUNC) === _filesystemConstants.linux.O_TRUNC) {
        await _reactNativeFs.default.writeFile(path.toString(), "");
    }
    if (!stat && writable && (flags & _filesystemConstants.linux.O_CREAT) === _filesystemConstants.linux.O_CREAT) {
        await _reactNativeFs.default.writeFile(path.toString(), "");
    }
    const index = Math.max(...Object.keys(FDs).map((k)=>parseInt(k)
    ), 0) + 1;
    FDs[index] = fd;
    return index;
};
exports.openFD = openFD;
const closeFD = (fd)=>{
    const descriptor = FDs[fd];
    if (!descriptor) {
        throw _err.default.EBADF();
    }
    delete FDs[fd];
};
exports.closeFD = closeFD;
const getFD = (fd)=>{
    const descriptor = FDs[fd];
    return descriptor;
};
exports.getFD = getFD;
