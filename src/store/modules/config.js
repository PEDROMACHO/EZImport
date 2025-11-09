import fs from "fs";
import path from "path";
import schema from "@index/config.schema.js";
import { remove } from "fs-extra";

const cs = new CSInterface();

const userConfigPath = path.join(
	cs.getSystemPath("userData"),
	"Adobe",
	"CEP",
	"Extensions",
	"EZImport",
	"config.json"
);

async function loadConfig() {
	try {
		if (!fs.existsSync(userConfigPath)) {
			await fs.promises.mkdir(path.dirname(userConfigPath), {
				recursive: true,
			});
			await fs.promises.writeFile(
				userConfigPath,
				JSON.stringify(schema.getProperties(), null, 2)
			);
		}

		const data = await fs.promises.readFile(userConfigPath, "utf-8");
		schema.load(JSON.parse(data));
		schema.validate({ allowed: "strict" });

		return schema.getProperties();
	} catch (err) {
		console.error("Ошибка загрузки конфига:", err);
		return schema.getProperties();
	}
}

async function saveConfig(newConfig) {
	try {
		schema.load(newConfig);
		schema.validate({ allowed: "strict" });

		await fs.promises.writeFile(
			userConfigPath,
			JSON.stringify(schema.getProperties(), null, 2)
		);
	} catch (err) {
		console.error("Ошибка сохранения конфига:", err);
	}
}

export default {
	namespaced: true,

	state: () => schema.getProperties(),

	actions: {
		async initConfig({ commit, dispatch }) {
			try {
				const cfg = await loadConfig();

				commit("setLibraries", cfg.libraries);
				commit("setSettings", cfg.settings);

				if (cfg.libraries?.length) {
					for (const lib of cfg.libraries) {
						await dispatch("manifest/ensure", lib.path, {
							root: true,
						});
						await dispatch("manifest/rebuildAll", lib.path, {
							root: true,
						});
					}
					await dispatch("categories/fetchCategories", null, {
						root: true,
					});
				}
			} catch (err) {
				dispatch(
					"notifications/error",
					{ text: `Ошибка загрузки: ${err.message}` },
					{ root: true }
				);
			}
		},

		async persistConfig({ state, dispatch }) {
			try {
				await saveConfig({
					libraries: state.libraries,
					settings: state.settings,
				});
			} catch (err) {
				dispatch(
					"notifications/error",
					{ text: `Ошибка сохранения: ${err.message}` },
					{ root: true }
				);
			}
		},
	},

	mutations: {
		setLibraries(state, libs) {
			state.libraries = libs;
		},
		addLibrary(state, lib) {
			// проверка на дубликаты по path
			const exists = state.libraries.some((l) => l.path === lib.path);
			if (!exists) {
				state.libraries.push(lib);
			} else {
				throw new Error("Библиотека с таким путем уже привязана");
			}
		},
		removeLibrary(state, index) {
			state.libraries.splice(index, 1);
		},
		updateLibraryType(state, { path, type }) {
			const lib = state.libraries.find((l) => l.path === path);
			if (lib) lib.type = type;
		},
		updateLibraryPath(state, { index, path }) {
			if (state.libraries[index]) {
				state.libraries[index].path = path;
			}
		},
		setSettings(state, settings) {
			state.settings = { ...state.settings, ...settings };
		},
	},

	getters: {
		getLibraryPath: (state) => (index) => {
			if (!state.libraries || !state.libraries.length) return null;
			const lib = state.libraries[index];
			return lib ? lib.path : null;
		},
		getLibrariesList: (state) => state.libraries,
	},
};
