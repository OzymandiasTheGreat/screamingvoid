// This file is auto generated by the protocol-buffers compiler

/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-redeclare */
/* eslint-disable camelcase */

// Remember to `npm install --save protocol-buffers-encodings`
var encodings = require('protocol-buffers-encodings')
var varint = encodings.varint
var skip = encodings.skip

exports.Purpose = {
  PEER: 0,
  MIRRORING: 1,
  MODERATION: 2,
  ADVERTISEMENT: 3
}

var VersionTag = exports.VersionTag = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

defineVersionTag()

function defineVersionTag () {
  VersionTag.encodingLength = encodingLength
  VersionTag.encode = encode
  VersionTag.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.version)) {
      var len = encodings.int32.encodingLength(obj.version)
      length += 1 + len
    }
    if (defined(obj.purpose)) {
      var len = encodings.enum.encodingLength(obj.purpose)
      length += 1 + len
    }
    if (defined(obj.profile)) {
      var len = encodings.int64.encodingLength(obj.profile)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.version)) {
      buf[offset++] = 8
      encodings.int32.encode(obj.version, buf, offset)
      offset += encodings.int32.encode.bytes
    }
    if (defined(obj.purpose)) {
      buf[offset++] = 16
      encodings.enum.encode(obj.purpose, buf, offset)
      offset += encodings.enum.encode.bytes
    }
    if (defined(obj.profile)) {
      buf[offset++] = 24
      encodings.int64.encode(obj.profile, buf, offset)
      offset += encodings.int64.encode.bytes
    }
    encode.bytes = offset - oldOffset
    return buf
  }

  function decode (buf, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buf.length
    if (!(end <= buf.length && offset <= buf.length)) throw new Error("Decoded message is not valid")
    var oldOffset = offset
    var obj = {
      version: 0,
      purpose: 0,
      profile: 0
    }
    while (true) {
      if (end <= offset) {
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
        obj.version = encodings.int32.decode(buf, offset)
        offset += encodings.int32.decode.bytes
        break
        case 2:
        obj.purpose = encodings.enum.decode(buf, offset)
        offset += encodings.enum.decode.bytes
        break
        case 3:
        obj.profile = encodings.int64.decode(buf, offset)
        offset += encodings.int64.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defined (val) {
  return val !== null && val !== undefined && (typeof val !== 'number' || !isNaN(val))
}