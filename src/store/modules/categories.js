import fs from "fs";
import path from "path";
import { readdirNames, isDir } from "@/utils/fs/fsCommon";
import { ensureUniqueDir, sanitizeFsName } from "@/utils/fs/fsSafe";

export default {
	namespaced: true,
	state: () => ({
		categories: [],
		currentCategory: null,
		error: null,
		searchField: "",
	}),
	mutations: {
		setCategories(s, v) {
			s.categories = v;
			if (!v.length) s.currentCategory = null;
		},
		setCurrentCategory(s, v) {
			s.currentCategory = v;
		},
		setSearchField(s, v) {
			s.searchField = v;
		},
		setError(s, v) {
			s.error = v;
		},
	},
	actions: {
		async fetchCategories({ commit, dispatch, rootState, state }) {
			const root = rootState.config.pathDirectory;
			if (!root) {
				commit("setError", "Папка не выбрана");
				return;
			}

			try {
				const top = await readdirNames(root);

				// берём только директории, исключая manifest.json и прочие файлы
				const catNames = [];
				for (const name of top) {
					const full = path.join(root, name);
					if (name === "manifest.json") continue;
					if (await isDir(full)) catNames.push(name);
				}

				const categories = await Promise.all(
					catNames.map(async (cat) => {
						const catPath = path.join(root, cat);
						// ВАЖНО: вызываем из модуля compositions
						const compositions = await dispatch(
							"compositions/fetchCompositions",
							catPath,
							{ root: true }
						);
						return { name: cat, path: catPath, compositions };
					})
				);

				commit("setCategories", categories);
				commit("setError", null);

				// восстановим выделение
				if (state.currentCategory) {
					const prev = state.currentCategory;
					const same = categories.find(
						(c) => c.path === prev.path || c.name === prev.name
					);
					commit("setCurrentCategory", same || null);
				}
			} catch (err) {
				commit("setError", `Ошибка при чтении папки: ${err.message}`);
			}
		},

		async createCategory({ rootState, dispatch, commit }, categoryName) {
			try {
				const root = rootState.config.pathDirectory;
				if (!root) {
					commit("setError", "Папка не выбрана");
					return;
				}
				const raw = (categoryName || "").trim();
				if (!raw) {
					commit("setError", "Укажите имя категории");
					return;
				}
				const safe = sanitizeFsName(raw);
				if (!safe) {
					commit("setError", "Недопустимое имя категории");
					return;
				}
				const { dirPath } = ensureUniqueDir(root, safe);
				fs.mkdirSync(dirPath, { recursive: true });
				await dispatch("fetchCategories");
				commit("setError", null);
			} catch (err) {
				commit(
					"setError",
					`Ошибка при создании категории: ${err.message}`
				);
			}
		},

		async clearError({ commit }) {
			commit("setError", "");
		},
	},

	getters: {
		getFilteredCategories(s) {
			if (!s.searchField) return s.categories;
			const q = s.searchField.toLowerCase();
			return s.categories.filter((c) => c.name.toLowerCase().includes(q));
		},
		getCategories: (s) => s.categories,
		getError: (s) => s.error,
		getCurrentCategory: (s) => s.currentCategory,
	},
};
