module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: { ie: "11" }, // максимально близко к ES5
				useBuiltIns: false,
				corejs: false,
				modules: false,
			},
		],
	],
	plugins: [
		// важно: не использовать transform-runtime!
	],
};
