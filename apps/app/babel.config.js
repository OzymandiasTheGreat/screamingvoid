module.exports = {
	presets: ["babel-preset-expo"],
	plugins: [
		"@babel/plugin-proposal-async-generator-functions",
		[
			"module-resolver",
			{
				alias: {},
			},
		],
	],
};
