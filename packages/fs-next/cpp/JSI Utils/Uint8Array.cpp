#include "Uint8Array.h"
#include <jsi/jsi.h>

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
	return getProperty(runtime, "length").asNumber();
}

size_t Uint8Array::byteLength(Runtime &runtime) const {
	return getProperty(runtime, "byteLength").asNumber();
}

size_t Uint8Array::byteOffset(Runtime &runtime) const {
	return getProperty(runtime, "byteOffset").asNumber();
}

unsigned char * Uint8Array::toArray(Runtime &runtime) {
	return reinterpret_cast<unsigned char *>(getBuffer(runtime).data(runtime)) + byteOffset(runtime);
}

ArrayBuffer Uint8Array::getBuffer(Runtime &runtime) const {
	return getProperty(runtime, "buffer").asObject(runtime).getArrayBuffer(runtime);
}