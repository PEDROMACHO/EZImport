// store/modules/config.js
import fs from "fs";
import path from "path";

const cs = new CSInterface();
const base = cs.getSystemPath("userData");
const pluginFolder = path.join(base, "Adobe", "CEP", "Extensions", "EZImport");
const configPath = path.join(pluginFolder, "config.json");

/**
 * Загружает конфиг из файла
 */
async function loadConfig() {
	try {
		const data = await fs.promises.readFile(configPath, "utf-8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}

/**
 * Сохраняет конфиг в файл
 */
async function saveConfig(config) {
	try {
		await fs.promises.mkdir(pluginFolder, { recursive: true });
		await fs.promises.writeFile(
			configPath,
			JSON.stringify(config, null, 2)
		);
	} catch (err) {
		console.error("Error saving config:", err);
	}
}

export default {
	namespaced: true,

	state: () => ({
		pathDirectory: null,
		libraryType: null,
		locale: "en", // по умолчанию
	}),

	mutations: {
		setPathDirectory(state, dir) {
			state.pathDirectory = dir;
		},
		setLibraryType(state, type) {
			state.libraryType = type;
		},
		setLocale(state, locale) {
			state.locale = locale;
		},
	},

	actions: {
		/**
		 * Инициализация конфига из файла
		 */
		async initConfig({ commit, dispatch }) {
			try {
				const config = await loadConfig();
				if (config.pathDirectory) {
					commit("setPathDirectory", config.pathDirectory);
				}
				if (config.locale) {
					commit("setLocale", config.locale);
				}
			} catch (err) {
				dispatch(
					"notifications/error",
					`Ошибка загрузки конфига: ${err.message}`,
					{ root: true }
				);
			}
		},

		/**
		 * Сохраняет текущий state в файл
		 */
		async persistConfig({ state, dispatch }) {
			try {
				await saveConfig({
					pathDirectory: state.pathDirectory,
					locale: state.locale,
				});
			} catch (err) {
				dispatch(
					"notifications/error",
					`Ошибка сохранения конфига: ${err.message}`,
					{ root: true }
				);
			}
		},

		/**
		 * Устанавливает директорию и сохраняет конфиг
		 */
		async updatePathDirectory({ commit, dispatch }, dir) {
			commit("setPathDirectory", dir);
			await dispatch("persistConfig");
		},

		/**
		 * Устанавливает локаль и сохраняет конфиг
		 */
		async updateLocale({ commit, dispatch }, locale) {
			commit("setLocale", locale);
			await dispatch("persistConfig");
		},
	},
};
