"use strict";
exports.default = void 0;
var _errno = _interopRequireDefault(require("errno"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const errno = {};
Object.keys(_errno.default.code).forEach((code)=>{
    const e = _errno.default.code[code];
    errno[code] = (path)=>{
        const err = new Error(`${code}, ${e.description} ${path ? `'${path}'` : ""}`);
        err.errno = e.errno;
        err.code = code;
        err.path = path;
        return err;
    };
});
var _default = errno;
exports.default = _default;
