#include <jsi/jsi.h>
#include "optional"

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

	unsigned char* toArray(Runtime& runtime) const;
	std::string toString(Runtime& runtime) const;
	ArrayBuffer getBuffer(Runtime& runtime) const;
};

Object getObject(Runtime& runtime, const Value& value);
bool getBooleanProperty(Runtime& runtime, const Value& arg, const char* prop, bool DEFAULT);
uint32_t getUInt32Property(Runtime& runtime, const Value& arg, const char* prop, uint32_t DEFAULT);
int getInt32Property(Runtime& runtime, const Value& arg, const char* prop, int DEFAULT);
std::string getStringProperty(Runtime& runtime, const Value& arg, const char* prop, std::string DEFAULT);
std::optional<std::string> getRangeOption(Runtime& runtime, const Value& arg, const char* opt);
bool checkRange(Runtime& runtime, const Value& options, const std::string target);
