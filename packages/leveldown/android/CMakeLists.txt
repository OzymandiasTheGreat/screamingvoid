cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "leveldown")
set (BUILD_DIR ${CMAKE_SOURCE_DIR}/build)

include_directories(
        "../cpp"
        "../native/${ANDROID_ABI}/include"
        "${NODE_MODULES_DIR}/react-native/React"
        "${NODE_MODULES_DIR}/react-native/React/Base"
        "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
)

add_library(leveldb SHARED IMPORTED)
set_target_properties(leveldb PROPERTIES IMPORTED_LOCATION "${PROJECT_SOURCE_DIR}/../native/${ANDROID_ABI}/lib/libleveldb.so")
file(COPY "${PROJECT_SOURCE_DIR}/../native/${ANDROID_ABI}/lib/libleveldb.so" DESTINATION "${PROJECT_SOURCE_DIR}/lib/${ANDROID_ABI}")

if(${REACT_NATIVE_VERSION} LESS 66)
        set (
                INCLUDE_JSI_CPP
                "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi/jsi/jsi.cpp"
        )
endif()

add_library(leveldown # <-- Library name
        SHARED
        "src/main/cpp/cpp-adapter.cpp"
        "../cpp/LevelHostObject.cpp"
        "../cpp/helpers.cpp"
        ${INCLUDE_JSI_CPP} # only on older RN versions
)

set_target_properties(
        leveldown PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

file (GLOB LIBRN_DIR "${PREBUILT_DIR}/${ANDROID_ABI}")

find_library(
        log-lib
        log
)
find_library(
        REACT_NATIVE_JNI_LIB
        reactnativejni
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)
if(${REACT_NATIVE_VERSION} LESS 66)
        # JSI lib didn't exist on RN 0.65 and before. Simply omit it.
        set (JSI_LIB "")
else()
        # RN 0.66 distributes libjsi.so, can be used instead of compiling jsi.cpp manually.
        find_library(
                JSI_LIB
                jsi
                PATHS ${LIBRN_DIR}
                NO_CMAKE_FIND_ROOT_PATH
        )
endif()

target_link_libraries(
        leveldown
        leveldb
        ${log-lib}
        ${JSI_LIB}
        ${REACT_NATIVE_JNI_LIB}
        android
)
