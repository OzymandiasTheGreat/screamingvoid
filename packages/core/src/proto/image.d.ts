type Image = {
	mimetype: string;
	data: Buffer;
};
const _image: Image;
const _buf: Buffer;

export const Image = {
	encode: (message: Image) => _buf,
	decode: (buf: Buffer) => _image,
};
