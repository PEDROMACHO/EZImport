// store/modules/config.js
import fs from "fs";
import path from "path";

const cs = new CSInterface();
// const base = cs.getSystemPath("userData");
// const pluginFolder = path.join(base, "Adobe", "CEP", "Extensions", "EZImport");
// const configPath = path.join(pluginFolder, "config.json");

const userConfigPath = path.join(
	cs.getSystemPath("userData"),
	"Adobe",
	"CEP",
	"Extensions",
	"EZImport",
	"config.json"
);

const defaultConfigPath = path.join(
	cs.getSystemPath("extension"),
	"config.default.json"
);

async function loadConfig() {
	try {
		const data = await fs.promises.readFile(userConfigPath, "utf-8");
		return JSON.parse(data);
	} catch {
		// если пользовательского файла нет — читаем дефолтный
		const data = await fs.promises.readFile(defaultConfigPath, "utf-8");
		return JSON.parse(data);
	}
}

/**
 * Сохраняет конфиг в файл
 */
async function saveConfig(config) {
	try {
		// создаём папку, где лежит userConfigPath
		await fs.promises.mkdir(path.dirname(userConfigPath), {
			recursive: true,
		});
		await fs.promises.writeFile(
			userConfigPath,
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
					{ text: `Ошибка загрузки конфига: ${err.message}` },
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
					{ text: `Ошибка сохранения конфига: ${err.message}` },
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
