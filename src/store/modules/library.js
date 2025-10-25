import fs from "fs";
import path from "path";
const fsPromises = fs.promises;

const TRASH = new Set([".DS_Store", "Thumbs.db"]);

export default {
	namespaced: true,

	actions: {
		/**
		 * Определяет тип библиотеки по содержимому папки
		 * - our: есть manifest.json
		 * - new: пустая папка (или только мусор)
		 * - invalid: есть содержимое, но нет manifest.json
		 * - error: ошибка чтения
		 */
		async detectLibraryType({ dispatch }, dir) {
			try {
				const items = await fsPromises.readdir(dir);
				if (items.includes("manifest.json")) return "our";

				return "new";

				// const meaningful = items.filter((n) => !TRASH.has(n));
				// if (meaningful.length === 0) return "new";

				// return "invalid";
			} catch (err) {
				dispatch(
					"notifications/error",
					{ text: `Ошибка при определении папки: ${err.message}` },
					{ root: true }
				);
				return "error";
			}
		},

		/**
		 * Инициализирует библиотеку в указанной папке
		 */
		async initLibrary({ dispatch }, dir) {
			const type = await dispatch("detectLibraryType", dir);

			if (type === "error" || type === "invalid") {
				if (type === "invalid") {
					dispatch(
						"notifications/error",
						{
							text: "Папка содержит файлы/папки без manifest.json. Выберите пустую папку или библиотеку EZImport.",
						},
						{ root: true }
					);
				}
				return false;
			}

			// обновляем конфиг через экшены
			await dispatch("config/updateLibraryType", type, { root: true });
			await dispatch("config/updatePathDirectory", dir, { root: true });
			await dispatch("categories/fetchCategories", null, { root: true });

			dispatch(
				"notifications/info",
				{ text: "Библиотека инициализирована" },
				{
					root: true,
				}
			);
			return true;
		},
	},
};
