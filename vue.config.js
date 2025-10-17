process.env.VUE_APP_VERSION = require("./package.json").version;
process.env.VUE_APP_AUTHOR = require("./package.json").author.name;

module.exports = {
	publicPath: "./",
	// Thanks Eric Robinson
	configureWebpack: {
		target: "node-webkit", // Set the target to node-webkit (https://webpack.js.org/configuration/target/)
		node: false, // Don't set certain Node globals/modules to empty objects (https://webpack.js.org/configuration/node/)
		resolve: {
			alias: {
				"core-js/fn": "core-js/features",
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
					// treat any tag that starts with ion- as custom elements
					isCustomElement: (tag) => tag.startsWith("ion-"),
				},
			}));
	},
	devServer: {
		watchOptions: { ignored: [/hiberfil\.sys$/, /DumpStack\.log\.tmp$/] },
	},
	lintOnSave: false,
};
