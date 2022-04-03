# @screamingvoid/leveldown

Native (C++) [LevelDB](https://github.com/google/leveldb) bindings for
React Native, implemented as JSI module. Fully
[abstract-leveldown](https://github.com/Level/abstract-leveldown)
compatible. Partially compatible with [leveldown](https://github.com/Level/leveldown)
extended API.

For documentation, see `abstract-leveldown` README, public API section.
As full safety is not guaranteed when using these bindings, it's recommended
to use [levelup](https://github.com/Level/levelup) to avoid accidental crashes.

## Speed and Binary Data

As these binding are implemented as JSI module, the speed of operations should be
pretty good. I haven't run the benchmarks yet, but it should perform close to
maximum speed of native LevelDB.

Again, as this is a JSI module, there's no marshalling/serialization happening
for binary data. In fact, I chose buffer as the native JavaScript format and
while strings and other data types are supported, they are first converted to
`Uint8Array`'s before being passed to native code.

For maximum performance you should stick to Buffer keys/values, to avoid
serialization penalty.


## Sync/Async

As `levelup`/`abstract-leveldown` offer only async API, so these bindings do too.

We do implement `{ sync: true }` option for write operations from `leveldown`
extended API. This does *NOT* make the call synchronous, but it does ensure
that when the callback is called/promise resolves, all changes have been written
to disk.

### Note for developers

The C++ binding is fully synchronous in a sense that all calls are synchronous.
The JavaScript API achieves asynchronicity through the use of `setImmediate`
calls.

What this means is that if you have a use case for synchronous access, you can
implements synchronous JavaScript API using the same native code.

If you do, pull requests are welcome. Do open an issue or drop me an email for
coordination then.

As I have no need for synchronous access and limited time/resources I probably
won't be implementing this myself.

## Leveldown Extended API

I'd like to support all of `leveldown`'s additional methods, not in `abstract-leveldown`
API. However as I do not have the time to implement and test them, that's a goal
for the future.

As it is, we support the `{ sync: true }` option and one additional method,
namely `approximateSize`. If you implement any others - pull requests are *very*
welcome. Do add the tests if you do.
