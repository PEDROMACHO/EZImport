module.exports = {
	purge: ["./src/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	darkMode: false, // or 'media' or 'class'
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [],
};
