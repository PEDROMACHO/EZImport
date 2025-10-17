import fs from "fs";
import path from "path";
import { readdirDirs } from "@/utils/fs/fsCommon";
import { ensureUniqueDirAsync, sanitizeFsName } from "@/utils/fs/fsSafe";

export default {
	namespaced: true,

	state: () => ({
		categories: [],
		searchField: "",
		currentCategory: null,
	}),

	mutations: {
		setCategories(state, categories) {
			state.categories = categories;
			if (!categories.length) state.currentCategory = null;
		},
		setCurrentCategory(state, category) {
			state.currentCategory = category;
		},
		setSearchField(state, value) {
			state.searchField = value;
		},
	},

	actions: {
		/**
		 * Загружает список категорий из файловой системы
		 */
		async fetchCategories({ commit, dispatch, rootState, state }) {
			const root = rootState.config.pathDirectory;
			if (!root) {
				dispatch("notifications/error", "Папка не выбрана", {
					root: true,
				});
				return;
			}

			try {
				const catNames = await readdirDirs(root);

				const categories = await Promise.all(
					catNames.map(async (cat) => {
						const catPath = path.join(root, cat);
						const compositions = await dispatch(
							"compositions/fetchCompositions",
							catPath,
							{ root: true }
						);
						return { name: cat, path: catPath, compositions };
					})
				);

				// сортировка по имени
				categories.sort((a, b) => a.name.localeCompare(b.name));

				commit("setCategories", categories);

				// восстановим или выберем первую категорию
				if (state.currentCategory) {
					const prev = state.currentCategory;
					const same = categories.find(
						(c) => c.path === prev.path || c.name === prev.name
					);
					commit("setCurrentCategory", same || null);
				} else if (categories.length) {
					commit("setCurrentCategory", categories[0]);
				}

				dispatch("notifications/info", "Категории обновлены", {
					root: true,
				});
			} catch (err) {
				dispatch(
					"notifications/error",
					`Ошибка при чтении папки: ${err.message}`,
					{ root: true }
				);
			}
		},

		/**
		 * Создаёт новую категорию в файловой системе
		 */
		async createCategory({ rootState, dispatch }, categoryName) {
			const root = rootState.config.pathDirectory;
			if (!root) {
				dispatch("notifications/error", "Папка не выбрана", {
					root: true,
				});
				return;
			}

			try {
				const raw = (categoryName || "").trim();
				if (!raw) {
					dispatch("notifications/warn", "Укажите имя категории", {
						root: true,
					});
					return;
				}

				const safe = sanitizeFsName(raw);
				if (!safe) {
					dispatch(
						"notifications/error",
						"Недопустимое имя категории",
						{
							root: true,
						}
					);
					return;
				}

				const { dirPath, dirName } = await ensureUniqueDirAsync(
					root,
					safe
				);
				await fs.promises.mkdir(dirPath, { recursive: true });

				await dispatch("fetchCategories");
				dispatch(
					"notifications/info",
					`Категория "${dirName}" создана`,
					{
						root: true,
					}
				);
			} catch (err) {
				dispatch(
					"notifications/error",
					`Ошибка при создании категории: ${err.message}`,
					{ root: true }
				);
			}
		},
	},

	getters: {
		getFilteredCategories(state) {
			if (!state.searchField) return state.categories;
			const q = state.searchField.toLowerCase();
			return state.categories.filter((c) =>
				c.name.toLowerCase().includes(q)
			);
		},
		getCategories: (state) => state.categories,
		getCurrentCategory: (state) => state.currentCategory,
	},
};
