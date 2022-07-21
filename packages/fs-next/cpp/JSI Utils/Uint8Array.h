#include <jsi/jsi.h>

using namespace facebook::jsi;

class Uint8Array : public Object {
public:
	Uint8Array(Runtime& runtime, const Value& array);
	Uint8Array(Runtime& runtime, size_t size);
	Uint8Array(Runtime& runtime, size_t size, unsigned char* data);
	Uint8Array(Uint8Array &&) = default;

	Uint8Array &operator=(Uint8Array &&) = default;

	size_t length(Runtime& runtime) const;
	size_t byteLength(Runtime& runtime) const;
	size_t byteOffset(Runtime& runtime) const;

	unsigned char* toArray(Runtime& runtime);
	ArrayBuffer getBuffer(Runtime &runtime) const;
};