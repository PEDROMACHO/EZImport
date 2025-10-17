import fs from "fs";
import path from "path";
const fsPromises = fs.promises;

const TRASH = new Set([".DS_Store", "Thumbs.db"]);

export default {
	namespaced: true,
	actions: {
		async detectLibraryType({ commit }, dir) {
			try {
				const items = await fsPromises.readdir(dir);
				if (items.includes("manifest.json")) return "our";

				// если в папке что-то есть, кроме мусора → запретить
				const meaningful = items.filter((n) => !TRASH.has(n));
				if (meaningful.length === 0) return "new"; // пустая папка (или только мусор)

				// есть содержимое → нельзя выбирать
				return "invalid";
			} catch (err) {
				commit(
					"config/setError",
					`Ошибка при определении папки: ${err.message}`,
					{ root: true }
				);
				return "error";
			}
		},

		async initLibrary({ commit, dispatch }, dir) {
			const type = await dispatch("detectLibraryType", dir);
			if (type === "error" || type === "invalid") {
				if (type === "invalid") {
					commit(
						"config/setError",
						"Папка содержит файлы/папки без manifest.json. Выберите пустую папку или библиотеку EZImport.",
						{ root: true }
					);
				}
				return false;
			}

			if (type === "new") {
				const manifestPath = path.join(dir, "manifest.json");
				try {
					const manifest = {
						libraryName: "EZImport Library",
						created: new Date().toISOString(),
						version: "1.0.0",
						categories: [],
					};
					fs.writeFileSync(
						manifestPath,
						JSON.stringify(manifest, null, 2)
					);
				} catch (err) {
					commit(
						"config/setError",
						`Не удалось создать manifest.json: ${err.message}`,
						{ root: true }
					);
					return false;
				}
			}

			commit("config/setLibraryType", type, { root: true });
			commit("config/setPathDirectory", dir, { root: true });
			return true;
		},
	},
};
