// esbuild.config.js
const esbuild = require("esbuild");

esbuild
	.build({
		entryPoints: ["./src/host/AEFT/src/index.js"],
		bundle: true,
		target: ["es5"], // ExtendScript понимает только ES3/ES5
		format: "iife", // самозапускающийся скрипт без import/export
		outfile: "./src/host/AEFT/host.jsx",
		banner: {
			js: "/* Compiled host.jsx for ExtendScript */",
		},
		footer: {
			js: "/* End of host.jsx */",
		},
	})
	.catch(() => process.exit(1));
