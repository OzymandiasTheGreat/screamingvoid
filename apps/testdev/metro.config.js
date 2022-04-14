/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
	fs: require.resolve("@screamingvoid/fs/index.ts"),
	os: require.resolve("react-native-os"),
	net: require.resolve("react-native-tcp"),
	dns: require.resolve("fetch-dns"),
	path: require.resolve("path-browserify"),
	dgram: require.resolve("react-native-udp"),
	stream: require.resolve("readable-stream"),
	crypto: require.resolve("react-native-crypto"),
	"utp-native": require.resolve("@screamingvoid/utp-native"),
	"sodium-universal": require.resolve("@screamingvoid/sodium-universal"),
};

module.exports = config;
