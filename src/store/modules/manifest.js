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
		manifests: {}, // { [rootDir]: { data, path, busy // { version, updated, rootDir, categories:[{name,path,count}], itemsByCategory:{[catPath]:[items]} } } }
	}),

	actions: {
		async ensure({ commit, dispatch }, rootDir) {
			try {
				if (!rootDir || !(await isDir(rootDir)))
					throw new Error("некорректный корень");

				const manifestPath = norm(path.join(rootDir, FILE_NAME));
				commit("SET_PATH", { rootDir, manifestPath });

				let loaded = null;
				try {
					loaded = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
				} catch {}

				const shaped = createManifestShape(rootDir, loaded);
				if (!loaded) {
					atomicWrite(manifestPath, JSON.stringify(shaped, null, 2));
				}

				commit("SET_DATA", { rootDir, data: shaped });
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

		async rebuildAll({ commit, dispatch, state }, rootDir) {
			const manifest = state.manifests[rootDir];
			if (manifest?.busy) return manifest.data;
			commit("SET_BUSY", { rootDir, busy: true });

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
					manifest?.path || norm(path.join(rootDir, FILE_NAME));
				atomicWrite(manifestPath, JSON.stringify(data, null, 2));

				commit("SET_PATH", { rootDir, manifestPath });
				commit("SET_DATA", { rootDir, data });

				dispatch(
					"notifications/info",
					{ text: "Манифест пересобран", silent: true },
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
				commit("SET_BUSY", { rootDir, busy: false });
			}
		},

		async upsertCategory(
			{ state, commit, dispatch },
			{ name, categoryPath }
		) {
			try {
				const rootDir = norm(path.dirname(categoryPath));
				const manifest = state.manifests[rootDir];
				if (!manifest?.data || !manifest?.path) {
					await dispatch("ensure", rootDir);
				}

				const safeCatPath = norm(categoryPath);
				const items = await scanCategoryItems(safeCatPath);

				const data = {
					...(state.manifests[rootDir]?.data ||
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

				atomicWrite(
					state.manifests[rootDir].path,
					JSON.stringify(data, null, 2)
				);
				commit("SET_DATA", { rootDir, data });

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

		async upsertComposition(
			{ state, commit, dispatch },
			{ categoryPath, composition }
		) {
			try {
				const rootDir = norm(path.dirname(categoryPath));
				const manifest = state.manifests[rootDir];
				if (!manifest?.data || !manifest?.path) {
					await dispatch("ensure", rootDir);
				}

				const safeCatPath = norm(categoryPath);
				const data = {
					...(state.manifests[rootDir]?.data ||
						createManifestShape(path.dirname(safeCatPath))),
				};

				if (!data.itemsByCategory[safeCatPath]) {
					data.itemsByCategory[safeCatPath] = [];
				}

				const idx = data.itemsByCategory[safeCatPath].findIndex(
					(c) => norm(c.path) === norm(composition.path)
				);

				if (idx >= 0) {
					data.itemsByCategory[safeCatPath][idx] = composition;
				} else {
					data.itemsByCategory[safeCatPath].push(composition);
				}

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

				atomicWrite(
					state.manifests[rootDir].path,
					JSON.stringify(data, null, 2)
				);
				commit("SET_DATA", { rootDir, data });

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
				const rootDir = norm(path.dirname(categoryPath));
				const manifest = state.manifests[rootDir];
				if (!manifest?.data || !manifest?.path) return false;

				const data = { ...manifest.data };
				const key = norm(categoryPath);

				delete data.itemsByCategory?.[key];
				data.categories = (data.categories || []).filter(
					(c) => norm(c.path) !== key
				);
				data.updated = new Date().toISOString();

				atomicWrite(manifest.path, JSON.stringify(data, null, 2));
				commit("SET_DATA", { rootDir, data });

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

	mutations: {
		SET_PATH(state, { rootDir, manifestPath }) {
			if (!state.manifests[rootDir]) state.manifests[rootDir] = {};
			state.manifests[rootDir].path = manifestPath;
		},
		SET_DATA(state, { rootDir, data }) {
			if (!state.manifests[rootDir]) state.manifests[rootDir] = {};
			state.manifests[rootDir].data = data;
		},
		SET_BUSY(state, { rootDir, busy }) {
			if (!state.manifests[rootDir]) state.manifests[rootDir] = {};
			state.manifests[rootDir].busy = !!busy;
		},
	},

	getters: {
		// получить весь манифест для конкретной библиотеки
		manifest: (s) => (rootDir) => s.manifests[rootDir]?.data,

		// список категорий для конкретной библиотеки
		categories: (s) => (rootDir) =>
			s.manifests[rootDir]?.data?.categories || [],

		// все itemsByCategory для конкретной библиотеки
		itemsByCategory: (s) => (rootDir) =>
			s.manifests[rootDir]?.data?.itemsByCategory || {},

		// получить список композиций для конкретной категории
		items: (s) => (categoryPath) => {
			const rootDir = norm(path.dirname(categoryPath));
			return (
				s.manifests[rootDir]?.data?.itemsByCategory?.[
					norm(categoryPath)
				] || []
			);
		},
	},
};
