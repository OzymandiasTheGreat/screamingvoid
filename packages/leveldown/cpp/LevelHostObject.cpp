#include "LevelHostObject.h"
#include "helpers.h"
#include <jsi/jsi.h>

namespace screamingvoid {

using namespace facebook::jsi;
using namespace std;

vector<PropNameID> LevelHostObject::getPropertyNames(Runtime& runtime) {
	vector<PropNameID> result;

	result.push_back(PropNameID::forUtf8(runtime, "crypto_aead_chacha20poly1305_encrypt"));

	return result;
}

Value LevelHostObject::get(Runtime& runtime, const PropNameID& propNameId) {
	auto propName = propNameId.utf8(runtime);

	if (propName == "crypto_aead_chacha20poly1305_encrypt") {
		auto aead_chacha20poly1305_encrypt = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			auto c = Uint8Array(runtime, arguments[0]);
			auto m = Uint8Array(runtime, arguments[1]);
			auto npub = Uint8Array(runtime, arguments[4]);
			auto k = Uint8Array(runtime, arguments[5]);
			unsigned long  long int clen_p;
			if (arguments[2].isNull()) {
				crypto_aead_chacha20poly1305_encrypt(c.toArray(runtime), &clen_p, m.toArray(runtime),
													 m.byteLength(runtime), nullptr, 0, nullptr,
													 npub.toArray(runtime), k.toArray(runtime));
			} else {
				auto ad = Uint8Array(runtime, arguments[2]);
				crypto_aead_chacha20poly1305_encrypt(c.toArray(runtime), &clen_p, m.toArray(runtime),
													 m.byteLength(runtime), ad.toArray(runtime), ad.byteLength(runtime),
													 nullptr, npub.toArray(runtime), k.toArray(runtime));
			}
			return Value((int) clen_p);
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "crypto_aead_chacha20poly1305_encrypt"), 6, aead_chacha20poly1305_encrypt);
	}
	return Value::undefined();
}

} // namespace screamingvoid
