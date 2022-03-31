cd leveldb

git clean -xdff
mkdir -p build && cd build
cmake -DCMAKE_SYSTEM_NAME="Android" \
	-DCMAKE_ANDROID_NDK="$ANDROID_NDK_HOME" \
	-DCMAKE_SYSTEM_VERSION="21" \
	-DCMAKE_ANDROID_ARCH_ABI="armeabi-v7a" \
	-DCMAKE_BUILD_TYPE="Release" \
	-DLEVELDB_BUILD_TESTS="OFF" \
	-DLEVELDB_BUILD_BENCHMARKS="OFF" \
	-DCMAKE_INSTALL_PREFIX="$(pwd)/../../native/armeabi-v7a" \
	-DBUILD_SHARED_LIBS="ON" \
	..
make && make install
cd ..

git clean -xdff
mkdir -p build && cd build
cmake -DCMAKE_SYSTEM_NAME="Android" \
	-DCMAKE_ANDROID_NDK="$ANDROID_NDK_HOME" \
	-DCMAKE_SYSTEM_VERSION="21" \
	-DCMAKE_ANDROID_ARCH_ABI="arm64-v8a" \
	-DCMAKE_BUILD_TYPE="Release" \
	-DLEVELDB_BUILD_TESTS="OFF" \
	-DLEVELDB_BUILD_BENCHMARKS="OFF" \
	-DCMAKE_INSTALL_PREFIX="$(pwd)/../../native/arm64-v8a" \
	-DBUILD_SHARED_LIBS="ON" \
	..
make && make install
cd ..

git clean -xdff
mkdir -p build && cd build
cmake -DCMAKE_SYSTEM_NAME="Android" \
	-DCMAKE_ANDROID_NDK="$ANDROID_NDK_HOME" \
	-DCMAKE_SYSTEM_VERSION="21" \
	-DCMAKE_ANDROID_ARCH_ABI="x86" \
	-DCMAKE_BUILD_TYPE="Release" \
	-DLEVELDB_BUILD_TESTS="OFF" \
	-DLEVELDB_BUILD_BENCHMARKS="OFF" \
	-DCMAKE_INSTALL_PREFIX="$(pwd)/../../native/x86" \
	-DBUILD_SHARED_LIBS="ON" \
	..
make && make install
cd ..

git clean -xdff
mkdir -p build && cd build
cmake -DCMAKE_SYSTEM_NAME="Android" \
	-DCMAKE_ANDROID_NDK="$ANDROID_NDK_HOME" \
	-DCMAKE_SYSTEM_VERSION="21" \
	-DCMAKE_ANDROID_ARCH_ABI="x86_64" \
	-DCMAKE_BUILD_TYPE="Release" \
	-DLEVELDB_BUILD_TESTS="OFF" \
	-DLEVELDB_BUILD_BENCHMARKS="OFF" \
	-DCMAKE_INSTALL_PREFIX="$(pwd)/../../native/x86_64" \
	-DBUILD_SHARED_LIBS="ON" \
	..
make && make install
cd ..

git clean -xdff
cd ..
