module.exports = {
	root: true,
	extends: ["@react-native-community", "prettier"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	overrides: [
		{
			files: ["*.ts", "*.tsx"],
			rules: {
				"@typescript-eslint/no-shadow": ["error"],
				"no-shadow": "off",
				"no-undef": "off",
			},
		},
	],
	rules: {
		"react-native/no-inline-styles": false,
	},
};
