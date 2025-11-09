// store/modules/library.js
import fs from "fs";
const fsPromises = fs.promises;

const TRASH = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

export default {
	namespaced: true,

	state: () => ({
		activeIndex: 0,
	}),

	actions: {
		/**
		 * Определяет тип библиотеки по содержимому папки.
		 * - our: есть manifest.json
		 * - new: пустая папка (или только мусорные файлы)
		 * - invalid: есть содержимое, но нет manifest.json
		 * - error: ошибка чтения директории
		 */
		async detectLibraryType({ dispatch, rootState }, dir) {
			try {
				// проверка на дубликаты
				const exists = rootState.config.libraries?.some(
					(l) => l.path === dir
				);
				if (exists) {
					await dispatch(
						"notifications/error",
						{ text: "Такая библиотека уже добавлена" },
						{ root: true }
					);
					return "duplicate";
				}

				const items = await fsPromises.readdir(dir);

				// наша библиотека
				if (items.includes("manifest.json")) return "our";

				// исключаем мусорные файлы
				const meaningful = items.filter((n) => !TRASH.has(n));

				// новая (пустая или только мусор)
				if (meaningful.length === 0) return "new";

				// невалидная
				return "invalid";
			} catch (err) {
				await dispatch(
					"notifications/error",
					{ text: `Ошибка при определении папки: ${err.message}` },
					{ root: true }
				);
				return "error";
			}
		},

		/**
		 * Инициализирует библиотеку:
		 * - проверяет тип
		 * - обновляет тип в config
		 * - при необходимости инициирует сборку манифеста и категорий
		 */
		async initLibrary({ commit, dispatch }, dir) {
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

			// обновить тип библиотеки в конфиге
			await dispatch(
				"config/updateLibraryType",
				{ path: dir, type },
				{ root: true }
			);

			// обеспечить/пересобрать манифест и обновить категории
			await dispatch("manifest/ensure", dir, { root: true });
			await dispatch("manifest/rebuildAll", dir, { root: true });
			await dispatch("categories/fetchCategories", null, { root: true });

			// сохранить изменения конфига
			await dispatch("config/persistConfig", null, { root: true });

			dispatch(
				"notifications/info",
				{ text: "Библиотека инициализирована" },
				{ root: true }
			);
			return true;
		},
	},

	mutations: {
		setActiveIndex(state, index) {
			if (index != state.activeIndex) {
				state.activeIndex = index;
			}
		},
	},

	getters: {
		getActiveIndex: (state) => state.activeIndex,
	},
};
