// This file is auto generated by the protocol-buffers compiler

/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-redeclare */
/* eslint-disable camelcase */

// Remember to `npm install --save protocol-buffers-encodings`
var encodings = require('protocol-buffers-encodings')
var varint = encodings.varint
var skip = encodings.skip

exports.ChatInputType = {
  POST: 1,
  REPLY: 2,
  DELETE: 3,
  REACT: 4
}

var ConversationMeta = exports.ConversationMeta = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ConversationPeer = exports.ConversationPeer = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ConversationInput = exports.ConversationInput = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ConversationRequest = exports.ConversationRequest = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ChatReaction = exports.ChatReaction = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ChatHash = exports.ChatHash = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ChatMessage = exports.ChatMessage = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var ChatInput = exports.ChatInput = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var Map_string_ConversationPeer = exports.Map_string_ConversationPeer = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

var Map_string_bytes = exports.Map_string_bytes = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
}

defineConversationMeta()
defineConversationPeer()
defineConversationInput()
defineConversationRequest()
defineChatReaction()
defineChatHash()
defineChatMessage()
defineChatInput()
defineMap_string_ConversationPeer()
defineMap_string_bytes()

function defineConversationMeta () {
  ConversationMeta.encodingLength = encodingLength
  ConversationMeta.encode = encode
  ConversationMeta.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.name)) {
      var len = encodings.string.encodingLength(obj.name)
      length += 1 + len
    }
    if (defined(obj.archived)) {
      var len = encodings.bool.encodingLength(obj.archived)
      length += 1 + len
    }
    if (defined(obj.muted)) {
      var len = encodings.bool.encodingLength(obj.muted)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.name)) {
      buf[offset++] = 10
      encodings.string.encode(obj.name, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.archived)) {
      buf[offset++] = 16
      encodings.bool.encode(obj.archived, buf, offset)
      offset += encodings.bool.encode.bytes
    }
    if (defined(obj.muted)) {
      buf[offset++] = 24
      encodings.bool.encode(obj.muted, buf, offset)
      offset += encodings.bool.encode.bytes
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
      name: "",
      archived: false,
      muted: false
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
        obj.name = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 2:
        obj.archived = encodings.bool.decode(buf, offset)
        offset += encodings.bool.decode.bytes
        break
        case 3:
        obj.muted = encodings.bool.decode(buf, offset)
        offset += encodings.bool.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineConversationPeer () {
  ConversationPeer.encodingLength = encodingLength
  ConversationPeer.encode = encode
  ConversationPeer.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.input)) {
      var len = encodings.bytes.encodingLength(obj.input)
      length += 1 + len
    }
    if (defined(obj.storage)) {
      var len = encodings.bytes.encodingLength(obj.storage)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.input)) {
      buf[offset++] = 10
      encodings.bytes.encode(obj.input, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.storage)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.storage, buf, offset)
      offset += encodings.bytes.encode.bytes
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
      input: null,
      storage: null
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
        obj.input = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 2:
        obj.storage = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineConversationInput () {
  ConversationInput.encodingLength = encodingLength
  ConversationInput.encode = encode
  ConversationInput.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.name)) {
      var len = encodings.string.encodingLength(obj.name)
      length += 1 + len
    }
    if (defined(obj.peers)) {
      var tmp = Object.keys(obj.peers)
      for (var i = 0; i < tmp.length; i++) {
        tmp[i] = {key: tmp[i], value: obj.peers[tmp[i]]}
      }
      for (var i = 0; i < tmp.length; i++) {
        if (!defined(tmp[i])) continue
        var len = Map_string_ConversationPeer.encodingLength(tmp[i])
        length += varint.encodingLength(len)
        length += 1 + len
      }
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.name)) {
      buf[offset++] = 10
      encodings.string.encode(obj.name, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.peers)) {
      var tmp = Object.keys(obj.peers)
      for (var i = 0; i < tmp.length; i++) {
        tmp[i] = {key: tmp[i], value: obj.peers[tmp[i]]}
      }
      for (var i = 0; i < tmp.length; i++) {
        if (!defined(tmp[i])) continue
        buf[offset++] = 18
        varint.encode(Map_string_ConversationPeer.encodingLength(tmp[i]), buf, offset)
        offset += varint.encode.bytes
        Map_string_ConversationPeer.encode(tmp[i], buf, offset)
        offset += Map_string_ConversationPeer.encode.bytes
      }
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
      name: "",
      peers: {}
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
        obj.name = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 2:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        var tmp = Map_string_ConversationPeer.decode(buf, offset, offset + len)
        obj.peers[tmp.key] = tmp.value
        offset += Map_string_ConversationPeer.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineConversationRequest () {
  ConversationRequest.encodingLength = encodingLength
  ConversationRequest.encode = encode
  ConversationRequest.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.name)) {
      var len = encodings.string.encodingLength(obj.name)
      length += 1 + len
    }
    if (defined(obj.peers)) {
      for (var i = 0; i < obj.peers.length; i++) {
        if (!defined(obj.peers[i])) continue
        var len = encodings.bytes.encodingLength(obj.peers[i])
        length += 1 + len
      }
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.name)) {
      buf[offset++] = 10
      encodings.string.encode(obj.name, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.peers)) {
      for (var i = 0; i < obj.peers.length; i++) {
        if (!defined(obj.peers[i])) continue
        buf[offset++] = 18
        encodings.bytes.encode(obj.peers[i], buf, offset)
        offset += encodings.bytes.encode.bytes
      }
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
      name: "",
      peers: []
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
        obj.name = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 2:
        obj.peers.push(encodings.bytes.decode(buf, offset))
        offset += encodings.bytes.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineChatReaction () {
  ChatReaction.encodingLength = encodingLength
  ChatReaction.encode = encode
  ChatReaction.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.char)) {
      var len = encodings.string.encodingLength(obj.char)
      length += 1 + len
    }
    if (defined(obj.sender)) {
      var len = encodings.bytes.encodingLength(obj.sender)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.char)) {
      buf[offset++] = 10
      encodings.string.encode(obj.char, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.sender)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.sender, buf, offset)
      offset += encodings.bytes.encode.bytes
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
      char: "",
      sender: null
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
        obj.char = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 2:
        obj.sender = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineChatHash () {
  ChatHash.encodingLength = encodingLength
  ChatHash.encode = encode
  ChatHash.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.body)) {
      var len = encodings.bytes.encodingLength(obj.body)
      length += 1 + len
    }
    if (defined(obj.attachments)) {
      var tmp = Object.keys(obj.attachments)
      for (var i = 0; i < tmp.length; i++) {
        tmp[i] = {key: tmp[i], value: obj.attachments[tmp[i]]}
      }
      for (var i = 0; i < tmp.length; i++) {
        if (!defined(tmp[i])) continue
        var len = Map_string_bytes.encodingLength(tmp[i])
        length += varint.encodingLength(len)
        length += 1 + len
      }
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.body)) {
      buf[offset++] = 10
      encodings.bytes.encode(obj.body, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.attachments)) {
      var tmp = Object.keys(obj.attachments)
      for (var i = 0; i < tmp.length; i++) {
        tmp[i] = {key: tmp[i], value: obj.attachments[tmp[i]]}
      }
      for (var i = 0; i < tmp.length; i++) {
        if (!defined(tmp[i])) continue
        buf[offset++] = 18
        varint.encode(Map_string_bytes.encodingLength(tmp[i]), buf, offset)
        offset += varint.encode.bytes
        Map_string_bytes.encode(tmp[i], buf, offset)
        offset += Map_string_bytes.encode.bytes
      }
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
      body: null,
      attachments: {}
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
        obj.body = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 2:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        var tmp = Map_string_bytes.decode(buf, offset, offset + len)
        obj.attachments[tmp.key] = tmp.value
        offset += Map_string_bytes.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineChatMessage () {
  ChatMessage.encodingLength = encodingLength
  ChatMessage.encode = encode
  ChatMessage.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.id)) {
      var len = encodings.bytes.encodingLength(obj.id)
      length += 1 + len
    }
    if (defined(obj.sender)) {
      var len = encodings.bytes.encodingLength(obj.sender)
      length += 1 + len
    }
    if (defined(obj.timestamp)) {
      var len = encodings.varint.encodingLength(obj.timestamp)
      length += 1 + len
    }
    if (defined(obj.hashes)) {
      var len = ChatHash.encodingLength(obj.hashes)
      length += varint.encodingLength(len)
      length += 1 + len
    }
    if (defined(obj.body)) {
      var len = encodings.string.encodingLength(obj.body)
      length += 1 + len
    }
    if (defined(obj.reaction)) {
      for (var i = 0; i < obj.reaction.length; i++) {
        if (!defined(obj.reaction[i])) continue
        var len = ChatReaction.encodingLength(obj.reaction[i])
        length += varint.encodingLength(len)
        length += 1 + len
      }
    }
    if (defined(obj.target)) {
      var len = encodings.bytes.encodingLength(obj.target)
      length += 1 + len
    }
    if (defined(obj.attachments)) {
      for (var i = 0; i < obj.attachments.length; i++) {
        if (!defined(obj.attachments[i])) continue
        var len = encodings.string.encodingLength(obj.attachments[i])
        length += 1 + len
      }
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.id)) {
      buf[offset++] = 10
      encodings.bytes.encode(obj.id, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.sender)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.sender, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.timestamp)) {
      buf[offset++] = 24
      encodings.varint.encode(obj.timestamp, buf, offset)
      offset += encodings.varint.encode.bytes
    }
    if (defined(obj.hashes)) {
      buf[offset++] = 34
      varint.encode(ChatHash.encodingLength(obj.hashes), buf, offset)
      offset += varint.encode.bytes
      ChatHash.encode(obj.hashes, buf, offset)
      offset += ChatHash.encode.bytes
    }
    if (defined(obj.body)) {
      buf[offset++] = 42
      encodings.string.encode(obj.body, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.reaction)) {
      for (var i = 0; i < obj.reaction.length; i++) {
        if (!defined(obj.reaction[i])) continue
        buf[offset++] = 50
        varint.encode(ChatReaction.encodingLength(obj.reaction[i]), buf, offset)
        offset += varint.encode.bytes
        ChatReaction.encode(obj.reaction[i], buf, offset)
        offset += ChatReaction.encode.bytes
      }
    }
    if (defined(obj.target)) {
      buf[offset++] = 58
      encodings.bytes.encode(obj.target, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.attachments)) {
      for (var i = 0; i < obj.attachments.length; i++) {
        if (!defined(obj.attachments[i])) continue
        buf[offset++] = 66
        encodings.string.encode(obj.attachments[i], buf, offset)
        offset += encodings.string.encode.bytes
      }
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
      id: null,
      sender: null,
      timestamp: 0,
      hashes: null,
      body: "",
      reaction: [],
      target: null,
      attachments: []
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
        obj.id = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 2:
        obj.sender = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 3:
        obj.timestamp = encodings.varint.decode(buf, offset)
        offset += encodings.varint.decode.bytes
        break
        case 4:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        obj.hashes = ChatHash.decode(buf, offset, offset + len)
        offset += ChatHash.decode.bytes
        break
        case 5:
        obj.body = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 6:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        obj.reaction.push(ChatReaction.decode(buf, offset, offset + len))
        offset += ChatReaction.decode.bytes
        break
        case 7:
        obj.target = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 8:
        obj.attachments.push(encodings.string.decode(buf, offset))
        offset += encodings.string.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineChatInput () {
  ChatInput.encodingLength = encodingLength
  ChatInput.encode = encode
  ChatInput.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.type)) {
      var len = encodings.enum.encodingLength(obj.type)
      length += 1 + len
    }
    if (defined(obj.sender)) {
      var len = encodings.bytes.encodingLength(obj.sender)
      length += 1 + len
    }
    if (defined(obj.timestamp)) {
      var len = encodings.varint.encodingLength(obj.timestamp)
      length += 1 + len
    }
    if (defined(obj.hashes)) {
      var len = ChatHash.encodingLength(obj.hashes)
      length += varint.encodingLength(len)
      length += 1 + len
    }
    if (defined(obj.target)) {
      var len = encodings.bytes.encodingLength(obj.target)
      length += 1 + len
    }
    if (defined(obj.body)) {
      var len = encodings.string.encodingLength(obj.body)
      length += 1 + len
    }
    if (defined(obj.reaction)) {
      var len = encodings.string.encodingLength(obj.reaction)
      length += 1 + len
    }
    if (defined(obj.attachments)) {
      for (var i = 0; i < obj.attachments.length; i++) {
        if (!defined(obj.attachments[i])) continue
        var len = encodings.string.encodingLength(obj.attachments[i])
        length += 1 + len
      }
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.type)) {
      buf[offset++] = 8
      encodings.enum.encode(obj.type, buf, offset)
      offset += encodings.enum.encode.bytes
    }
    if (defined(obj.sender)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.sender, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.timestamp)) {
      buf[offset++] = 24
      encodings.varint.encode(obj.timestamp, buf, offset)
      offset += encodings.varint.encode.bytes
    }
    if (defined(obj.hashes)) {
      buf[offset++] = 34
      varint.encode(ChatHash.encodingLength(obj.hashes), buf, offset)
      offset += varint.encode.bytes
      ChatHash.encode(obj.hashes, buf, offset)
      offset += ChatHash.encode.bytes
    }
    if (defined(obj.target)) {
      buf[offset++] = 42
      encodings.bytes.encode(obj.target, buf, offset)
      offset += encodings.bytes.encode.bytes
    }
    if (defined(obj.body)) {
      buf[offset++] = 50
      encodings.string.encode(obj.body, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.reaction)) {
      buf[offset++] = 58
      encodings.string.encode(obj.reaction, buf, offset)
      offset += encodings.string.encode.bytes
    }
    if (defined(obj.attachments)) {
      for (var i = 0; i < obj.attachments.length; i++) {
        if (!defined(obj.attachments[i])) continue
        buf[offset++] = 66
        encodings.string.encode(obj.attachments[i], buf, offset)
        offset += encodings.string.encode.bytes
      }
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
      type: 1,
      sender: null,
      timestamp: 0,
      hashes: null,
      target: null,
      body: "",
      reaction: "",
      attachments: []
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
        obj.type = encodings.enum.decode(buf, offset)
        offset += encodings.enum.decode.bytes
        break
        case 2:
        obj.sender = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 3:
        obj.timestamp = encodings.varint.decode(buf, offset)
        offset += encodings.varint.decode.bytes
        break
        case 4:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        obj.hashes = ChatHash.decode(buf, offset, offset + len)
        offset += ChatHash.decode.bytes
        break
        case 5:
        obj.target = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
        break
        case 6:
        obj.body = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 7:
        obj.reaction = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        break
        case 8:
        obj.attachments.push(encodings.string.decode(buf, offset))
        offset += encodings.string.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineMap_string_ConversationPeer () {
  Map_string_ConversationPeer.encodingLength = encodingLength
  Map_string_ConversationPeer.encode = encode
  Map_string_ConversationPeer.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (!defined(obj.key)) throw new Error("key is required")
    var len = encodings.string.encodingLength(obj.key)
    length += 1 + len
    if (defined(obj.value)) {
      var len = ConversationPeer.encodingLength(obj.value)
      length += varint.encodingLength(len)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (!defined(obj.key)) throw new Error("key is required")
    buf[offset++] = 10
    encodings.string.encode(obj.key, buf, offset)
    offset += encodings.string.encode.bytes
    if (defined(obj.value)) {
      buf[offset++] = 18
      varint.encode(ConversationPeer.encodingLength(obj.value), buf, offset)
      offset += varint.encode.bytes
      ConversationPeer.encode(obj.value, buf, offset)
      offset += ConversationPeer.encode.bytes
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
      key: "",
      value: null
    }
    var found0 = false
    while (true) {
      if (end <= offset) {
        if (!found0) throw new Error("Decoded message is not valid")
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
        obj.key = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        found0 = true
        break
        case 2:
        var len = varint.decode(buf, offset)
        offset += varint.decode.bytes
        obj.value = ConversationPeer.decode(buf, offset, offset + len)
        offset += ConversationPeer.decode.bytes
        break
        default:
        offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineMap_string_bytes () {
  Map_string_bytes.encodingLength = encodingLength
  Map_string_bytes.encode = encode
  Map_string_bytes.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (!defined(obj.key)) throw new Error("key is required")
    var len = encodings.string.encodingLength(obj.key)
    length += 1 + len
    if (defined(obj.value)) {
      var len = encodings.bytes.encodingLength(obj.value)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (!defined(obj.key)) throw new Error("key is required")
    buf[offset++] = 10
    encodings.string.encode(obj.key, buf, offset)
    offset += encodings.string.encode.bytes
    if (defined(obj.value)) {
      buf[offset++] = 18
      encodings.bytes.encode(obj.value, buf, offset)
      offset += encodings.bytes.encode.bytes
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
      key: "",
      value: null
    }
    var found0 = false
    while (true) {
      if (end <= offset) {
        if (!found0) throw new Error("Decoded message is not valid")
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
        obj.key = encodings.string.decode(buf, offset)
        offset += encodings.string.decode.bytes
        found0 = true
        break
        case 2:
        obj.value = encodings.bytes.decode(buf, offset)
        offset += encodings.bytes.decode.bytes
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
