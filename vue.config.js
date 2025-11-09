const path = require("path");

process.env.VUE_APP_VERSION = require("./package.json").version;
process.env.VUE_APP_AUTHOR = require("./package.json").author.name;

module.exports = {
	publicPath: "./",
	transpileDependencies: [
		"@lit",
		"lit-html",
		"@lit-html",
		"@lit-labs",
		"colorjs.io",
		"lit-element",
	],
	configureWebpack: {
		target: "node-webkit",
		node: false,
		resolve: {
			alias: {
				"core-js/fn": "core-js/features",
				"@index": path.resolve(__dirname, ""),
				"@host": path.resolve(__dirname, "host"),
			},
		},
	},
	chainWebpack: (config) => {
		config.module
			.rule("vue")
			.use("vue-loader")
			.tap((options) => ({
				...options,
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith("ion-"),
				},
			}));
	},
	devServer: {
		watchOptions: { ignored: [/hiberfil\.sys$/, /DumpStack\.log\.tmp$/] },
	},
	lintOnSave: false,
};
