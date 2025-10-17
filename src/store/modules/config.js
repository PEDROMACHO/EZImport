// store/modules/config.js
import fs from "fs";
import path from "path";

const cs = new CSInterface();
const base = cs.getSystemPath("userData");
const pluginFolder = path.join(base, "Adobe", "CEP", "Extensions", "EZImport");
const configPath = path.join(pluginFolder, "config.json");

function loadConfig() {
	try {
		if (fs.existsSync(configPath)) {
			return JSON.parse(fs.readFileSync(configPath, "utf-8"));
		}
	} catch (err) {
		console.error("Error loading config:", err);
	}
	return {};
}

function saveConfig(config) {
	try {
		if (!fs.existsSync(pluginFolder)) {
			fs.mkdirSync(pluginFolder, { recursive: true });
		}
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
	} catch (err) {
		console.error("Error saving config:", err);
	}
}

export default {
	namespaced: true,
	state: {
		pathDirectory: null,
		libraryType: null,
		locale: "en", // по умолчанию
	},
	mutations: {
		setPathDirectory(state, dir) {
			state.pathDirectory = dir;
			saveConfig({
				...loadConfig(),
				pathDirectory: dir,
				locale: state.locale,
			});
		},
		setLibraryType(state, type) {
			state.libraryType = type;
		},
		setLocale(state, locale) {
			state.locale = locale;
			saveConfig({
				...loadConfig(),
				pathDirectory: state.pathDirectory,
				locale,
			});
		},
	},
	actions: {
		initConfig({ commit }) {
			const config = loadConfig();
			if (config.pathDirectory) {
				commit("setPathDirectory", config.pathDirectory);
			}
			if (config.locale) {
				commit("setLocale", config.locale);
			}
		},
	},
};
