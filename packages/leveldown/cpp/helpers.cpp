#include "helpers.h"
#include <jsi/jsi.h>
#include "optional"

using namespace facebook::jsi;

Uint8Array::Uint8Array(Runtime &runtime, const Value& array) : Object(array.asObject(runtime)) {
	auto ctor = runtime.global().getPropertyAsFunction(runtime, "Uint8Array");
	if (!instanceOf(runtime, ctor)) {
		throw JSError(runtime, "Expected an instance of Uint8Array");
	}
}

Uint8Array::Uint8Array(Runtime &runtime, size_t size) : Uint8Array(
		runtime,
		runtime
			.global()
			.getPropertyAsFunction(runtime, "Uint8Array")
			.callAsConstructor(runtime, (double) size)
			.asObject(runtime)
		) {}

Uint8Array::Uint8Array(Runtime &runtime, size_t size, unsigned char *data) : Uint8Array(runtime, size) {
	memcpy(toArray(runtime), data, size);
}

size_t Uint8Array::length(Runtime &runtime) const {
	return (size_t) getProperty(runtime, "length").asNumber();
}

size_t Uint8Array::byteLength(Runtime &runtime) const {
	return (size_t) getProperty(runtime, "byteLength").asNumber();
}

size_t Uint8Array::byteOffset(Runtime &runtime) const {
	return (size_t) getProperty(runtime, "byteOffset").asNumber();
}

unsigned char * Uint8Array::toArray(Runtime &runtime) const {
	return reinterpret_cast<unsigned char *>(getBuffer(runtime).data(runtime)) + byteOffset(runtime);
}

ArrayBuffer Uint8Array::getBuffer(Runtime &runtime) const {
	return getProperty(runtime, "buffer").asObject(runtime).getArrayBuffer(runtime);
}

std::string Uint8Array::toString(Runtime &runtime) const {
	auto start = getBuffer(runtime).data(runtime) + byteOffset(runtime);
	auto end = start + byteLength(runtime);
	return std::string(start, end);
}


Object getObject(Runtime& runtime, const Value& value) {
	if (!value.isObject()) {
		throw JSError(runtime, "Must be an object");
	}
	return value.getObject(runtime);
}

bool getBooleanProperty(Runtime& runtime, const Value& arg, const char* prop, bool DEFAULT) {
	auto obj = getObject(runtime, arg);
	if (!obj.hasProperty(runtime, prop)) {
		return DEFAULT;
	}
	auto value = obj.getProperty(runtime, prop);
	if (!value.isBool()) {
		throw JSError(runtime, std::string(prop) + "must be boolean");
	}
	return value.getBool();
}

uint32_t getUInt32Property(Runtime& runtime, const Value& arg, const char* prop, uint32_t DEFAULT) {
	auto obj = getObject(runtime, arg);
	if (!obj.hasProperty(runtime, prop)) {
		return DEFAULT;
	}
	auto value = obj.getProperty(runtime, prop);
	if (!value.isNumber()) {
		throw JSError(runtime, std::string(prop) + "must be number");
	}
	return (uint32_t) value.getNumber();
}

int getInt32Property(Runtime& runtime, const Value& arg, const char* prop, int DEFAULT) {
	auto obj = getObject(runtime, arg);
	if (!obj.hasProperty(runtime, prop)) {
		return DEFAULT;
	}
	auto value = obj.getProperty(runtime, prop);
	if (!value.isNumber()) {
		throw JSError(runtime, std::string(prop) + "must be number");
	}
	return (int) value.getNumber();
}

std::string getStringProperty(Runtime& runtime, const Value& arg, const char* prop, std::string DEFAULT) {
	auto obj = getObject(runtime, arg);
	if (!obj.hasProperty(runtime, prop)) {
		return DEFAULT;
	}
	auto value = obj.getProperty(runtime, prop);
	if (value.isString()) {
		return value.getString(runtime).utf8(runtime);
	}
	auto buffer = Uint8Array(runtime, value);
	return buffer.toString(runtime);
}

std::optional<std::string> getRangeOption(Runtime& runtime, const Value& arg, const char* opt) {
	auto obj = getObject(runtime, arg);
	if (!obj.hasProperty(runtime, opt)) {
		return std::nullopt;
	}
	return Uint8Array(runtime, obj.getProperty(runtime, opt)).toString(runtime);
}

bool checkRange(Runtime& runtime, const Value& options, const std::string target) {
	auto gt = getRangeOption(runtime, options, "gt");
	auto gte = getRangeOption(runtime, options, "gte");
	auto lt = getRangeOption(runtime, options, "lt");
	auto lte = getRangeOption(runtime, options, "lte");
	return ((lt && target.compare(*lt) >= 0) ||
	        (lte && target.compare(*lte) > 0) ||
	        (gt && target.compare(*gt) <= 0) ||
	        (gte && target.compare(*gte) < 0));
}