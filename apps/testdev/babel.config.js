module.exports = {
	presets: ["module:metro-react-native-babel-preset"],
	plugins: [
		"@babel/plugin-proposal-async-generator-functions",
		[
			"module-resolver",
			{
				alias: {
					"utp-native": "@screamingvoid/utp-native",
					"sodium-native": "@screamingvoid/sodium-universal",
				},
			},
		],
	],
};
