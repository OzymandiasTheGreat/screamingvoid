#include <jni.h>
#include <jsi/jsi.h>
#include <pthread.h>
#include "FSHostObject.h"

using namespace facebook::jsi;
using namespace std;

JavaVM *java_vm;
jclass java_class;
jobject java_object;

/**
 * A simple callback function that allows us to detach current JNI Environment
 * when the thread
 * See https://stackoverflow.com/a/30026231 for detailed explanation
 */

void DeferThreadDetach(JNIEnv *env) {
	static pthread_key_t thread_key;

	// Set up a Thread Specific Data key, and a callback that
	// will be executed when a thread is destroyed.
	// This is only done once, across all threads, and the value
	// associated with the key for any given thread will initially
	// be NULL.
	static auto run_once = [] {
		const auto err = pthread_key_create(&thread_key, [](void *ts_env) {
			if (ts_env) {
				java_vm->DetachCurrentThread();
			}
		});
		if (err) {
			// Failed to create TSD key. Throw an exception if you want to.
		}
		return 0;
	}();

	// For the callback to actually be executed when a thread exits
	// we need to associate a non-NULL value with the key on that thread.
	// We can use the JNIEnv* as that value.
	const auto ts_env = pthread_getspecific(thread_key);
	if (!ts_env) {
		if (pthread_setspecific(thread_key, env)) {
			// Failed to set thread-specific value for key. Throw an exception if you want to.
		}
	}
}

/**
 * Get a JNIEnv* valid for this thread, regardless of whether
 * we're on a native thread or a Java thread.
 * If the calling thread is not currently attached to the JVM
 * it will be attached, and then automatically detached when the
 * thread is destroyed.
 *
 * See https://stackoverflow.com/a/30026231 for detailed explanation
 */
JNIEnv *GetJniEnv() {
	JNIEnv *env = nullptr;
	// We still call GetEnv first to detect if the thread already
	// is attached. This is done to avoid setting up a DetachCurrentThread
	// call on a Java thread.

	// g_vm is a global.
	auto get_env_result = java_vm->GetEnv((void **) &env, JNI_VERSION_1_6);
	if (get_env_result == JNI_EDETACHED) {
		if (java_vm->AttachCurrentThread(&env, nullptr) == JNI_OK) {
			DeferThreadDetach(env);
		} else {
			// Failed to attach thread. Throw an exception if you want to.
		}
	} else if (get_env_result == JNI_EVERSION) {
		// Unsupported JNI version. Throw an exception if you want to.
	}
	return env;
}

void install(Runtime& runtime) {
    auto hostObject = make_shared<screamingvoid::FSHostObject>();
    auto object = Object::createFromHostObject(runtime, hostObject);
    runtime.global().setProperty(runtime, "__FSProxy", move(object));

	auto getFD = Function::createFromHostFunction(runtime,
												  PropNameID::forUtf8(runtime, "getFileDescriptor"),
												  2,
												  [](Runtime &runtime,
														  const Value &thisValue,
														  const Value *arguments,
														  size_t count) -> Value {
		JNIEnv *env = GetJniEnv();
//		java_class = env->FindClass("me/screamingvoid/fs/FSModule");
		jmethodID jmethod = env->GetMethodID(java_class, "getFileDescriptor", "(Ljava/lang/String;Ljava/lang/String;)I");
		jvalue args[2];
		args[0].l = env->NewStringUTF(arguments[0].getString(runtime).utf8(runtime).c_str());
		args[1].l = env->NewStringUTF(arguments[1].getString(runtime).utf8(runtime).c_str());
		jint result = env->CallIntMethodA(java_object, jmethod, args);
		return Value((int) result);
	});
	runtime.global().setProperty(runtime, "__getFileDescriptor", move(getFD));
}

extern "C"
JNIEXPORT void JNICALL
Java_me_screamingvoid_fs_FSModule_nativeInstall(JNIEnv *env, jclass clazz, jlong jsiPtr, jobject thiz) {
    auto runtime = reinterpret_cast<Runtime*>(jsiPtr);
    if (runtime) {
        install(*runtime);
    }
    // if runtime was nullptr, fs will not be installed. This should only happen while Remote Debugging (Chrome), but will be weird either way.
	env->GetJavaVM(&java_vm);
	java_class = (jclass) env->NewGlobalRef(clazz);
	java_object = env->NewGlobalRef(thiz);
}
