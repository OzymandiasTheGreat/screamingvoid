#include "FSHostObject.h"
#include "JSI Utils/Uint8Array.h"
#include <jsi/jsi.h>
#include <boost/iostreams/device/file_descriptor.hpp>

namespace screamingvoid {

using namespace facebook::jsi;
using namespace std;

vector<PropNameID> FSHostObject::getPropertyNames(Runtime& runtime) {
	vector<PropNameID> result;

	result.push_back(PropNameID::forUtf8(runtime, "test"));
	result.push_back(PropNameID::forUtf8(runtime, "readFileFD"));

	return result;
}

Value FSHostObject::get(Runtime& runtime, const PropNameID& propNameId) {
	auto propName = propNameId.utf8(runtime);

	if (propName == "test") {
		return Value(13);
	}
	if (propName == "readFileFD") {
		auto readFileFD = Function::createFromHostFunction(runtime,
														   PropNameID::forUtf8(runtime, "readFileFD"),
														   1,
														   [](Runtime &runtime,
																   const Value &thisValue,
																   const Value *arguments,
																   size_t count) -> Value {
			int ifd;
			if (arguments[0].isNumber()) {
				ifd = (int) arguments[0].getNumber();
			} else {
				throw runtime_error("FD must be a number");
			}
			boost::iostreams::file_descriptor fd(ifd, boost::iostreams::file_descriptor_flags::never_close_handle);
			auto size = fd.seek(0, ios::seekdir::end);
			Uint8Array buffer(runtime, (size_t) size);
			fd.seek(0, ios::seekdir::beg);
			fd.read((char *) buffer.toArray(runtime), (int) size);
			return Value(runtime, buffer);
		});
		return readFileFD;
	}

	return Value::undefined();
}

} // namespace screamingvoid
