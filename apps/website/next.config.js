// @generated: @expo/next-adapter@4.0.9
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#withexpo

const { withExpo } = require("@expo/next-adapter");
const withPlugins = require("next-compose-plugins");
const withTM = require("next-transpile-modules");
const withPreact = require("next-plugin-preact");
const withFonts = require("next-fonts");

module.exports = withPlugins([
	[
		withPreact,
		{
			webpack: (config) => {
				config.resolve.alias = {
					...config.resolve.alias,
					"react-dom/unstable-native-dependencies$":
						"preact-responder-event-plugin",
				};
				return config;
			},
		},
	],
	[
		withTM(["react-native-web"]),
		{
			typescript: {
				ignoreBuildErrors: true,
			},
		},
	],
	[
		withExpo,
		{
			projectRoot: __dirname,
			webpack5: true,
			experimental: {
				images: {
					unoptimized: true,
				},
			},
		},
	],
	withFonts,
]);
