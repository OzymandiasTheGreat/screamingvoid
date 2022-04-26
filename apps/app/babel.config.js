module.exports = {
	presets: ["babel-preset-expo"],
	plugins: [
		"@babel/plugin-proposal-async-generator-functions",
		[
			"module-resolver",
			{
				alias: {
					leveldown: "@screamingvoid/leveldown",
					"sodium-universal": "@screamingvoid/sodium-universal",
					"utp-native": "@screamingvoid/utp-native",
				},
			},
		],
	],
};
