// @ts-ignore
import ERRNO from "errno";

const errno: {
	[code in
		| "ENOENT"
		| "UNKNOWN"
		| "OK"
		| "EOF"
		| "EADDRINFO"
		| "EACCES"
		| "EAGAIN"
		| "EADDRINUSE"
		| "EADDRNOTAVAIL"
		| "EAFNOSUPPORT"
		| "EALREADY"
		| "EBADF"
		| "EBUSY"
		| "ECONNABORTED"
		| "ECONNREFUSED"
		| "ECONNRESET"
		| "EDESTADDRREQ"
		| "EFAULT"
		| "EHOSTUNREACH"
		| "EINTR"
		| "EINVAL"
		| "EISCONN"
		| "EMFILE"
		| "EMSGSIZE"
		| "ENETDOWN"
		| "ENETUNREACH"
		| "ENFILE"
		| "ENOBUFS"
		| "ENOMEM"
		| "ENOTDIR"
		| "EISDIR"
		| "ENONET"
		| "ENOTCONN"
		| "ENOTSOCK"
		| "ENOTSUP"
		| "ENOSYS"
		| "EPIPE"
		| "EPROTO"
		| "EPROTONOSUPPORT"
		| "EPROTOTYPE"
		| "ETIMEDOUT"
		| "ECHARSET"
		| "EAIFAMNOSUPPORT"
		| "EAISERVICE"
		| "EAISOCKTYPE"
		| "ESHUTDOWN"
		| "EEXIST"
		| "ESRCH"
		| "ENAMETOOLONG"
		| "EPERM"
		| "ELOOP"
		| "EXDEV"
		| "ENOTEMPTY"
		| "ENOSPC"
		| "EIO"
		| "EROFS"
		| "ENODEV"
		| "ESPIPE"
		| "ECANCELED"]: (path?: string) => NodeJS.ErrnoException;
} = {} as any;

Object.keys(ERRNO.code).forEach((code) => {
	const e = ERRNO.code[code];
	(errno as any)[code] = (path?: string) => {
		const err: NodeJS.ErrnoException = new Error(
			`${code}, ${e.description} ${path ? `'${path}'` : ""}`,
		);
		err.errno = e.errno;
		err.code = code;
		err.path = path;
		return err;
	};
});

export default errno;
