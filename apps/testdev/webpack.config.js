const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(env, argv);
	// Customize the config before returning it.
	config.resolve.alias.buffer = require.resolve("buffer/");
	config.resolve.alias.stream = "readable-stream";
	return config;
};
