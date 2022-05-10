module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			"@babel/plugin-proposal-async-generator-functions",
			[
				"module-resolver",
				{
					alias: {
						fs: "@screamingvoid/fs",
						leveldown: "@screamingvoid/leveldown",
						"random-access-file":
							"@screamingvoid/random-access-file",
						"sodium-universal": "@screamingvoid/sodium-universal",
						"utp-native": "@screamingvoid/utp-native",
					},
				},
			],
		],
	};
};
