# @screamingvoid/fs

Node 16's fs API implemented on top of [react-native-fs](https://github.com/itinance/react-native-fs)
Implementation is mostly complete and fully tested.

- Async callback and `fs/promises` APIs are fully implemented.
- Sync API cannot currently be implemented because of react-native/native bridge.
- `promisify` API should work, but I haven't tested it yet.
- File descriptors. I took inspiration from `level-filesystem` and implemented emulation layer on top of available features.
- Errors. `react-native-fs` returns `EUNSPECIFIED` for most (all?) errors. We do some additional checking and return errors you'd expect (`ENOENT`, `EISDIR`, etc)
- Symlinks/hardlinks don't work. As far as I'm
aware there are no libraries that expose linking
functionallity on react-native, thus linking-related functions fail with `NotImplemented` error.
- Watches don't work. See above about linking, same situation.
- Streams are fully supported.
- Random access is fully supported. Tested with `random-access-file` and it's test suite.

For documentation see [node's fs docs](https://nodejs.org/docs/latest-v16.x/api/fs.html) and keep in mind above notes.

# Contributing

As I don't work with fs directly much, I may have missed some use cases in the tests or misinterpreted the docs. If you encounter such a case, please open an issue on Github, or better yet submit a PR. You should start with a test and then implement fixes accordingly. Test only PRs are also accepted.
