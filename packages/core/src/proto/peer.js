// This file is auto generated by the protocol-buffers compiler

/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-redeclare */
/* eslint-disable camelcase */

// Remember to `npm install --save protocol-buffers-encodings`
var encodings = require('protocol-buffers-encodings')
var varint = encodings.varint
var skip = encodings.skip

var CachedPeer = exports.CachedPeer = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

defineCachedPeer()

function defineCachedPeer () {
  CachedPeer.encodingLength = encodingLength
  CachedPeer.encode = encode
  CachedPeer.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.publicKey)) {
      var len = encodings.bytes.encodingLength(obj.publicKey)
      length += 1 + len
    }
    if (defined(obj.boxPublicKey)) {
      var len = encodings.bytes.encodingLength(obj.boxPublicKey)
      length += 1 + len
    }
    if (defined(obj.sharedSecret)) {
      var len = encodings.bytes.encodingLength(obj.sharedSecret)
      length += 1 + len
    }
    if (defined(obj.hostId)) {
      var len = encodings.bytes.encodingLength(obj.hostId)
      length += 1 + len
    }
    if (defined(obj.profile)) {
      var len = encodings.int64.encodingLength(obj.profile)
      length += 1 + len
    }
    if (defined(obj.name)) {
      var len = encodings.string.encodingLength(obj.name)
      length += 1 + len
    }
    if (defined(obj.bio)) {
      var len = encodings.string.encodingLength(obj.bio)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.publicKey)) {
      buf[offset++] = 10
      encodings.bytes.encode(obj.publicKey, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.boxPublicKey)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.boxPublicKey, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.sharedSecret)) {
      buf[offset++] = 26
      encodings.bytes.encode(obj.sharedSecret, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.hostId)) {
      buf[offset++] = 34
      encodings.bytes.encode(obj.hostId, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.profile)) {
      buf[offset++] = 48
      encodings.int64.encode(obj.profile, buf, offset)
      offset += encodings.int64.encode.bytes
    }
    if (defined(obj.name)) {
      buf[offset++] = 58
      encodings.string.encode(obj.name, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.bio)) {
      buf[offset++] = 66
      encodings.string.encode(obj.bio, buf, offset)
      offset += encodings.string.encode.bytes
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
      publicKey: null,
      boxPublicKey: null,
      sharedSecret: null,
      hostId: null,
      profile: 0,
      name: "",
      bio: ""
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
        obj.publicKey = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 2:
        obj.boxPublicKey = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 3:
        obj.sharedSecret = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 4:
        obj.hostId = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 6:
        obj.profile = encodings.int64.decode(buf, offset)
        offset += encodings.int64.decode.bytes
        break
        case 7:
        obj.name = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 8:
        obj.bio = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
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
