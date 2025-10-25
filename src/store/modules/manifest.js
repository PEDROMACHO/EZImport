// store/modules/libraryManifest.js
import fs from "fs";
import path from "path";
import { isDir, readdirDirs } from "@/utils/fs/fsCommon";
import {
	norm,
	atomicWrite,
	createManifestShape,
	scanCategoryItems,
	sortCategories,
} from "@/utils/manifestHelper";

const FILE_NAME = "manifest.json";

export default {
	namespaced: true,

	state: () => ({
		busy: false,
		path: null,
		data: null, // { version, updated, rootDir, categories:[{name,path,count}], itemsByCategory:{[catPath]:[items]} }
	}),

	mutations: {
		SET_PATH: (s, p) => (s.path = p),
		SET_DATA: (s, d) => (s.data = d),
		SET_BUSY: (s, v) => (s.busy = !!v),
	},

	actions: {
		/**
		 * Ensure that manifest file exists and if not, create a new one
		 * @param {Object} context - { commit, dispatch }
		 * @param {string} rootDir - root directory to look for manifest file
		 * @returns {Promise<Object>} - shaped manifest data
		 * @throws {Error} - if manifest file cannot be read or written
		 */
		async ensure({ commit, dispatch }, rootDir) {
			try {
				if (!rootDir || !(await isDir(rootDir)))
					throw new Error("некорректный корень");

				const manifestPath = norm(path.join(rootDir, FILE_NAME));
				commit("SET_PATH", manifestPath);

				let loaded = null;
				try {
					loaded = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
				} catch {}

				const shaped = createManifestShape(rootDir, loaded);
				if (!loaded) {
					atomicWrite(manifestPath, JSON.stringify(shaped, null, 2));
				}

				commit("SET_DATA", shaped);
				return shaped;
			} catch (e) {
				dispatch(
					"notifications/error",
					{ text: `Manifest ensure: ${e.message}` },
					{ root: true }
				);
				return null;
			}
		},

		/**
		 * Rebuilds entire manifest file by scanning the root directory
		 * and all its subdirectories for composition files.
		 * @param {Object} context - { commit, dispatch }
		 * @param {string} rootDir - root directory to look for composition files
		 * @returns {Promise<Object>} - shaped manifest data (categories, itemsByCategory, rootDir, updated)
		 * @throws {Error} - if manifest file cannot be read or written
		 */
		async rebuildAll({ commit, dispatch, state }, rootDir) {
			if (state.busy) return state.data;
			commit("SET_BUSY", true);

			try {
				const cats = await readdirDirs(rootDir);
				const itemsByCategory = {};
				const categories = [];

				for (const name of cats) {
					const catPath = norm(path.join(rootDir, name));
					const items = await scanCategoryItems(catPath);
					itemsByCategory[catPath] = items;
					categories.push({
						name,
						path: catPath,
						count: items.length,
					});
				}

				const data = {
					version: 1,
					updated: new Date().toISOString(),
					rootDir,
					categories: sortCategories(categories),
					itemsByCategory,
				};

				const manifestPath =
					state.path || norm(path.join(rootDir, FILE_NAME));
				atomicWrite(manifestPath, JSON.stringify(data, null, 2));

				commit("SET_PATH", manifestPath);
				commit("SET_DATA", data);

				dispatch(
					"notifications/info",
					{ text: "Глобальный манифест пересобран" },
					{ root: true }
				);
				return data;
			} catch (e) {
				dispatch(
					"notifications/error",
					{ text: `Manifest rebuild: ${e.message}` },
					{ root: true }
				);
				return null;
			} finally {
				commit("SET_BUSY", false);
			}
		},

		/**
		 * UpsertCategory - Adds a new category to the manifest or updates an existing one.
		 * If the category does not exist, it will be created and added to the manifest.
		 * If the category exists, its items will be rescanned and the category will be updated.
		 *
		 * @param {Object} context - { state, commit, dispatch }
		 * @param {Object} category - { name, categoryPath } - name and path of the category to upsert
		 * @returns {Promise<Array<{name:string,path:string,files:string[],formats:string[],previewPath:string|null}>>} - list of items in the category
		 * @throws {Error} - if manifest file cannot be read or written
		 */
		async upsertCategory(
			{ state, commit, dispatch },
			{ name, categoryPath }
		) {
			try {
				if (!state.data || !state.path) {
					const rootDir = norm(path.dirname(categoryPath));
					await dispatch("ensure", rootDir);
				}

				const safeCatPath = norm(categoryPath);
				const items = await scanCategoryItems(safeCatPath);

				const data = {
					...(state.data ||
						createManifestShape(path.dirname(safeCatPath))),
				};

				data.itemsByCategory[safeCatPath] = items;

				const rec = {
					name: name || path.basename(safeCatPath),
					path: safeCatPath,
					count: items.length,
				};

				const idx = data.categories.findIndex(
					(c) => norm(c.path) === safeCatPath
				);
				if (idx >= 0) data.categories[idx] = rec;
				else data.categories.push(rec);

				data.categories = sortCategories(data.categories);
				data.updated = new Date().toISOString();

				atomicWrite(state.path, JSON.stringify(data, null, 2));
				commit("SET_DATA", data);

				dispatch(
					"notifications/info",
					{ text: `Манифест обновлён: ${rec.name}`, silent: true },
					{ root: true }
				);
				return items;
			} catch (e) {
				dispatch(
					"notifications/error",
					{ text: `Manifest upsert: ${e.message}` },
					{ root: true }
				);
				return [];
			}
		},

		/**
		 * Removes a category from the manifest.
		 * If the category does not exist, does nothing.
		 * If the category exists, it will be removed from the manifest.
		 *
		 * @param {Object} context - { state, commit, dispatch }
		 * @param {string} categoryPath - path of the category to remove
		 * @returns {Promise<boolean>} - true if category was removed, false otherwise
		 * @throws {Error} - if manifest file cannot be read or written
		 */

		/**
		 * UpsertComposition - Добавляет или обновляет композицию в категории.
		 * Если композиция уже есть (по path), она будет обновлена.
		 * Если нет — добавляется новая.
		 *
		 * @param {Object} context - { state, commit, dispatch }
		 * @param {Object} payload - { categoryPath, composition }
		 * @returns {Promise<Object|null>} - обновлённая композиция или null при ошибке
		 */
		async upsertComposition(
			{ state, commit, dispatch },
			{ categoryPath, composition }
		) {
			try {
				if (!state.data || !state.path) {
					const rootDir = norm(path.dirname(categoryPath));
					await dispatch("ensure", rootDir);
				}

				const safeCatPath = norm(categoryPath);
				const data = {
					...(state.data ||
						createManifestShape(path.dirname(safeCatPath))),
				};

				if (!data.itemsByCategory[safeCatPath]) {
					data.itemsByCategory[safeCatPath] = [];
				}

				// ищем по path (уникальный ключ)
				const idx = data.itemsByCategory[safeCatPath].findIndex(
					(c) => norm(c.path) === norm(composition.path)
				);

				if (idx >= 0) {
					// обновляем
					data.itemsByCategory[safeCatPath][idx] = composition;
				} else {
					// добавляем
					data.itemsByCategory[safeCatPath].push(composition);
				}

				// обновляем категорию (count)
				const rec = {
					name: path.basename(safeCatPath),
					path: safeCatPath,
					count: data.itemsByCategory[safeCatPath].length,
				};

				const catIdx = data.categories.findIndex(
					(c) => norm(c.path) === safeCatPath
				);
				if (catIdx >= 0) data.categories[catIdx] = rec;
				else data.categories.push(rec);

				data.categories = sortCategories(data.categories);
				data.updated = new Date().toISOString();

				atomicWrite(state.path, JSON.stringify(data, null, 2));
				commit("SET_DATA", data);

				dispatch(
					"notifications/info",
					{
						text: `Композиция обновлена: ${composition.name}`,
						silent: true,
					},
					{ root: true }
				);

				return composition;
			} catch (e) {
				dispatch(
					"notifications/error",
					{ text: `Manifest upsertComposition: ${e.message}` },
					{ root: true }
				);
				return null;
			}
		},

		async removeCategory({ state, commit, dispatch }, categoryPath) {
			try {
				if (!state.data || !state.path) return false;

				const data = { ...state.data };
				const key = norm(categoryPath);

				delete data.itemsByCategory?.[key];
				data.categories = (data.categories || []).filter(
					(c) => norm(c.path) !== key
				);
				data.updated = new Date().toISOString();

				atomicWrite(state.path, JSON.stringify(data, null, 2));
				commit("SET_DATA", data);

				dispatch(
					"notifications/warn",
					{ text: "Категория удалена из манифеста" },
					{ root: true }
				);
				return true;
			} catch (e) {
				dispatch(
					"notifications/error",
					{ text: `Manifest remove: ${e.message}` },
					{ root: true }
				);
				return false;
			}
		},
	},

	getters: {
		manifest: (s) => s.data,
		categories: (s) => s.data?.categories || [],
		itemsByCategory: (s) => s.data?.itemsByCategory || {},
		items: (s) => (categoryPath) =>
			s.data?.itemsByCategory?.[norm(categoryPath)] || [],
	},
};
