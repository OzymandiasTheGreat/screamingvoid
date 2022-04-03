#include "LevelHostObject.h"
#include "helpers.h"
#include <jsi/jsi.h>
#include <leveldb/db.h>
#include <leveldb/write_batch.h>
#include "optional"

namespace screamingvoid {

using namespace facebook::jsi;
using namespace std;

std::vector<std::unique_ptr<leveldb::DB>> DATABASES;
std::vector<std::unique_ptr<leveldb::Iterator>> ITERATORS;

void seekToRange(leveldb::Iterator* iterator, bool reverse, optional<string> gt, optional<string> gte, optional<string> lt, optional<string> lte) {
	if (!reverse && gte) {
		iterator->Seek(*gte);
	} else if (!reverse && gt) {
		iterator->Seek(*gt);
		if (iterator->Valid() && iterator->key().compare(*gt) == 0) {
			iterator->Next();
		}
	} else if (reverse && lte) {
		iterator->Seek(*lte);
		if (!iterator->Valid()) {
			iterator->SeekToLast();
		} else if (iterator->key().compare(*lte) > 0) {
			iterator->Prev();
		}
	} else if (reverse && lt) {
		iterator->Seek(*lt);
		if (!iterator->Valid()) {
			iterator->SeekToLast();
		} else if (iterator->key().compare(*lt) >= 0) {
			iterator->Prev();
		}
	} else if (reverse) {
		iterator->SeekToLast();
	} else {
		iterator->SeekToFirst();
	}
}

vector<PropNameID> LevelHostObject::getPropertyNames(Runtime& runtime) {
	vector<PropNameID> result;

	result.push_back(PropNameID::forUtf8(runtime, "open"));
	result.push_back(PropNameID::forUtf8(runtime, "close"));
	result.push_back(PropNameID::forUtf8(runtime, "put"));
	result.push_back(PropNameID::forUtf8(runtime, "get"));
	result.push_back(PropNameID::forUtf8(runtime, "getMany"));
	result.push_back(PropNameID::forUtf8(runtime, "del"));
	result.push_back(PropNameID::forUtf8(runtime, "batch"));
	result.push_back(PropNameID::forUtf8(runtime, "approximateSize"));
	result.push_back(PropNameID::forUtf8(runtime, "iterator_init"));
	result.push_back(PropNameID::forUtf8(runtime, "iterator_next"));
	result.push_back(PropNameID::forUtf8(runtime, "iterator_seek"));
	result.push_back(PropNameID::forUtf8(runtime, "iterator_end"));
	result.push_back(PropNameID::forUtf8(runtime, "clear"));

	return result;
}

Value LevelHostObject::get(Runtime& runtime, const PropNameID& propNameId) {
	auto propName = propNameId.utf8(runtime);

	if (propName == "open") {
		auto open = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			auto location = Uint8Array(runtime, arguments[0]);
			bool createIfMissing = getBooleanProperty(runtime, arguments[1], "createIfMissing", true);
			bool errorIfExists = getBooleanProperty(runtime, arguments[1], "errorIfExists", false);
			bool compression = getBooleanProperty(runtime, arguments[1], "compression", true);

			leveldb::DB* db;
			leveldb::Options options;
			options.create_if_missing = createIfMissing;
			options.error_if_exists = errorIfExists;
			options.compression = compression ? leveldb::kSnappyCompression : leveldb::kNoCompression;

			leveldb::Status status = leveldb::DB::Open(options, location.toString(runtime), &db);
			if (!status.ok()) {
				return Value(runtime, JSError(runtime, status.ToString()).value());
			} else {
				DATABASES.push_back(std::unique_ptr<leveldb::DB>{db});
				return Value((int) DATABASES.size() - 1);
			}
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "open"), 2, open);
	}
	if (propName == "close") {
		auto close = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			DATABASES[index].reset();
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "close"), 1, close);
	}
	if (propName == "put") {
		auto put = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			string key = Uint8Array(runtime, arguments[1]).toString(runtime);
			string val = Uint8Array(runtime, arguments[2]).toString(runtime);
			bool sync = getBooleanProperty(runtime, arguments[3], "sync", false);
			Function cb = arguments[4].getObject(runtime).asFunction(runtime);

			leveldb::WriteOptions options;
			options.sync = sync;
			leveldb::Status status = db->Put(options, key, val);
			if (status.ok()) {
				cb.call(runtime);
			} else {
				cb.call(runtime, JSError(runtime, status.ToString()).value());
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "put"), 5, put);
	}
	if (propName == "get") {
		auto get = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			string key = Uint8Array(runtime, arguments[1]).toString(runtime);
			string val;
			leveldb::Status status = db->Get(leveldb::ReadOptions(), key, &val);
			if (status.ok()) {
				return Value(runtime,
				             Uint8Array(runtime, val.size(), (unsigned char *) val.data()));
			} else {
				return Value(runtime, JSError(runtime, status.ToString()).value());
			}
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "get"), 2, get);
	}
	if (propName == "getMany") {
		auto getMany = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			Array keys = arguments[1].getObject(runtime).asArray(runtime);

			Array ret = runtime.global().getPropertyAsFunction(runtime, "Array").callAsConstructor(runtime).getObject(runtime).asArray(runtime);
			for (int i = 0; i < keys.length(runtime); i++) {
				string key = Uint8Array(runtime, keys.getValueAtIndex(runtime, i)).toString(runtime);
				string val;
				leveldb::Status status = db->Get(leveldb::ReadOptions(), key, &val);
				if (status.ok()) {
					ret.setValueAtIndex(runtime, i, Value(runtime, Uint8Array(runtime, val.size(), (unsigned char *) val.data())));
				} else {
					ret.setValueAtIndex(runtime, i, Value::null());
				}
			}
			return Value(runtime, ret);
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "getMany"), 2, getMany);
	}
	if (propName == "del") {
		auto del = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			string key = Uint8Array(runtime, arguments[1]).toString(runtime);
			bool sync = getBooleanProperty(runtime, arguments[2], "sync", false);
			Function cb = arguments[3].getObject(runtime).asFunction(runtime);

			leveldb::WriteOptions options;
			options.sync = sync;
			leveldb::Status status = db->Delete(options, key);
			if (status.ok()) {
				cb.call(runtime);
			} else {
				cb.call(runtime, JSError(runtime, status.ToString()).value());
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "del"), 4, del);
	}
	if (propName == "batch") {
		auto batch = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			Array ops = arguments[1].getObject(runtime).asArray(runtime);
			bool sync = getBooleanProperty(runtime, arguments[2], "sync", false);
			Function cb = arguments[3].getObject(runtime).asFunction(runtime);

			leveldb::WriteOptions options;
			options.sync = sync;

			leveldb::WriteBatch batch;
			for (int i = 0; i < ops.length(runtime); i++) {
				auto op = ops.getValueAtIndex(runtime, i);
				string type = getStringProperty(runtime, op, "type", "");
				string key = getStringProperty(runtime, op, "key", "");
				if (type == "put") {
					string val = getStringProperty(runtime, op, "value", "");
					batch.Put(key, val);
				} else {
					batch.Delete(key);
				}
			}
			leveldb::Status status = db->Write(options, &batch);
			if (status.ok()) {
				cb.call(runtime);
			} else {
				cb.call(runtime, JSError(runtime, status.ToString()).value());
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "batch"), 4, batch);
	}
	if (propName == "approximateSize") {
		auto approximateSize = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			string start = Uint8Array(runtime, arguments[1]).toString(runtime);
			string end = Uint8Array(runtime, arguments[2]).toString(runtime);
			Function cb = arguments[3].getObject(runtime).asFunction(runtime);

			leveldb::Range range[1];
			range[0] = leveldb::Range(start, end);
			uint64_t size[1];
			db->GetApproximateSizes(range, 1, size);
			cb.call(runtime, Value::undefined(), Value((int) size[0]));
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "approximateSize"), 4, approximateSize);
	}
	if (propName == "iterator_init") {
		auto iterator_init = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			leveldb::ReadOptions options;
			options.snapshot = nullptr;
			leveldb::Iterator* iterator = db->NewIterator(options);

			auto gt = getRangeOption(runtime, arguments[1], "gt");
			auto gte = getRangeOption(runtime, arguments[1], "gte");
			auto lt = getRangeOption(runtime, arguments[1], "lt");
			auto lte = getRangeOption(runtime, arguments[1], "lte");
			bool reverse = getBooleanProperty(runtime, arguments[1], "reverse", false);

			seekToRange(iterator, reverse, gt, gte, lt, lte);

			ITERATORS.push_back(unique_ptr<leveldb::Iterator>{iterator});
			return Value((int) ITERATORS.size() - 1);
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "iterator_init"), 2, iterator_init);
	}
	if (propName == "iterator_next") {
		auto iterator_next = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::Iterator* iterator = ITERATORS[index].get();
			bool reverse = getBooleanProperty(runtime, arguments[1], "reverse", false);
			int limit = getInt32Property(runtime, arguments[1], "limit", -1);
			int count = (int) arguments[2].getNumber();
			Function cb = arguments[3].getObject(runtime).asFunction(runtime);

			bool ended = (limit >= 0 && count >= limit) || !(iterator->Valid());
			string key;
			string val;
			if (!ended) {
				key = iterator->key().ToString();
				val = iterator->value().ToString();
				reverse ? iterator->Prev() : iterator->Next();
				ended = checkRange(runtime, arguments[1], key);
			}

			leveldb::Status status = iterator->status();
			if (ended) {
				cb.call(runtime, Value::null());
			} else if (!status.ok()) {
				cb.call(runtime, JSError(runtime, status.ToString()).value());
			} else {
				cb.call(runtime,
						Value::null(),
						Uint8Array(runtime, key.size(), (unsigned char *) key.data()),
						Uint8Array(runtime, val.size(), (unsigned char *) val.data()));
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "iterator_next"), 4, iterator_next);
	}
	if (propName == "iterator_seek") {
		auto iterator_seek = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::Iterator* iterator = ITERATORS[index].get();
			string target = Uint8Array(runtime, arguments[2]).toString(runtime);
			bool reverse = getBooleanProperty(runtime, arguments[1], "reverse", false);

			if (checkRange(runtime, arguments[1], target)) {
				iterator->SeekToLast();
				iterator->Next();
			} else {
				iterator->Seek(target);
				if (iterator->Valid()) {
					int cmp = iterator->key().compare(target);
					if (reverse ? cmp > 0 : cmp < 0) {
						reverse ? iterator->Prev() : iterator->Next();
					}
				} else {
					reverse ? iterator->SeekToLast() : iterator->SeekToFirst();
					if (iterator->Valid()) {
						int cmp = iterator->key().compare(target);
						if (reverse ? cmp > 0 : cmp < 0) {
							iterator->SeekToLast();
							iterator->Next();
						}
					}
				}
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "iterator_seek"), 3, iterator_seek);
	}
	if (propName == "iterator_end") {
		auto iterator_end = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			ITERATORS[index].reset();
			Function cb = arguments[1].getObject(runtime).asFunction(runtime);
			cb.call(runtime);
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "iterator_end"), 2, iterator_end);
	}
	if (propName == "clear") {
		auto clear = [](Runtime& runtime, const Value&, const Value* arguments, size_t) -> Value {
			int index = (int) arguments[0].getNumber();
			leveldb::DB* db = DATABASES[index].get();
			Function cb = arguments[2].getObject(runtime).asFunction(runtime);

			bool sync = getBooleanProperty(runtime, arguments[1], "sync", false);
			bool reverse = getBooleanProperty(runtime, arguments[1], "reverse", false);
			int limit = getInt32Property(runtime, arguments[1], "limit", -1);
			auto gt = getRangeOption(runtime, arguments[1], "gt");
			auto gte = getRangeOption(runtime, arguments[1], "gte");
			auto lt = getRangeOption(runtime, arguments[1], "lt");
			auto lte = getRangeOption(runtime, arguments[1], "lte");

			leveldb::ReadOptions roptions;
			roptions.snapshot = nullptr;
			leveldb::Iterator* iterator = db->NewIterator(roptions);
			leveldb::WriteBatch batch;

			seekToRange(iterator, reverse, gt, gte, lt, lte);
			int count = 0;
			while (iterator->Valid() && (limit < 0 || count < limit)) {
				batch.Delete(iterator->key());
				iterator->Next();
			}
			delete iterator;

			leveldb::WriteOptions woptions;
			woptions.sync = sync;
			leveldb::Status status = db->Write(woptions, &batch);
			if (status.ok()) {
				cb.call(runtime);
			} else {
				cb.call(runtime, JSError(runtime, status.ToString()).value());
			}
			return Value::undefined();
		};
		return Function::createFromHostFunction(runtime, PropNameID::forUtf8(runtime, "clear"), 3, clear);
	}

	return Value::undefined();
}

} // namespace screamingvoid
