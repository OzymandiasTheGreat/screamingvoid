// @generated: @expo/next-adapter@4.0.9
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#shared-steps

module.exports = {
	presets: ["@expo/next-adapter/babel"],
	plugins: [
		["@babel/plugin-proposal-private-property-in-object", { loose: true }],
		["@babel/plugin-proposal-private-methods", { loose: true }],
	],
};
