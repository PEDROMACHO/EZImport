import fs from "fs";
import path from "path";

import { evalScript } from "cluecumber";
import { ensureUniqueDir, sanitizeFsName } from "@/utils/fs/fsSafe";
import { readdirNames, isDir, toFilesList } from "@/utils/fs/fsCommon";

const PREVIEW_EXT = [".gif", ".png", ".jpg", ".jpeg", ".webp"];
const COMP_EXT = [".aep", ".mov"];

function pickPreview(files) {
	for (const ext of PREVIEW_EXT) {
		const f = files.find((x) => x.format === ext);
		if (f) return f.path;
	}
	return null;
}

export default {
	namespaced: true,
	state: () => ({
		error: null,
	}),
	mutations: {
		setError(s, v) {
			s.error = v;
		},
	},
	actions: {
		async fetchCompositions({ commit }, categoryPath) {
			try {
				const names = await readdirNames(categoryPath);

				// только подпапки — кандидаты на композиции
				const compDirs = [];
				for (const name of names) {
					const full = path.join(categoryPath, name);
					if (await isDir(full)) compDirs.push({ name, full });
				}

				const compositions = [];
				for (const { name, full } of compDirs) {
					const childNames = await readdirNames(full);
					const files = toFilesList(full, childNames);

					// композиция = содержит .aep или .mov
					const hasComp = files.some((f) =>
						COMP_EXT.includes(f.format)
					);
					if (!hasComp) continue;

					const formats = files
						.filter((f) => COMP_EXT.includes(f.format))
						.map((f) => f.format);
					const filesPaths = files
						.filter((f) => COMP_EXT.includes(f.format))
						.map((f) => f.path);

					const previewPath = pickPreview(files);

					compositions.push({
						name,
						path: full,
						files,
						formats,
						filesPaths,
						previewPath,
					});
				}

				commit("setError", null);
				return compositions;
			} catch (err) {
				commit(
					"setError",
					`Ошибка при чтении композиций: ${err.message}`
				);
				return [];
			}
		},

		async fetchFiles(_, directoryPath) {
			try {
				if (!(await isDir(directoryPath))) return [];
				const names = await readdirNames(directoryPath);
				return toFilesList(directoryPath, names);
			} catch {
				return [];
			}
		},

		async saveComposition(
			{ dispatch, commit },
			{ compTitle, category, options = {} }
		) {
			console.log("Saving composition", compTitle, category, options);
			try {
				if (!category?.path) {
					commit("setError", "Категория не выбрана");
					return false;
				}

				const stripExt = (s) => String(s || "").replace(/\.[^.]+$/, "");
				const baseTitle = sanitizeFsName(
					stripExt(compTitle) || "Composition"
				);
				const { dirPath: finalDir } = ensureUniqueDir(
					category.path,
					baseTitle
				);
				// папку можно не создавать — JSX сам создаст. Но не помешает:
				if (!fs.existsSync(finalDir))
					fs.mkdirSync(finalDir, { recursive: true });

				const opts = {
					destDir: finalDir.replace(/\\/g, "/"),
					title: baseTitle, // без .aep
					wantMov: !!options.mov,
					pngAtSeconds: Number(options.pngAtSeconds || 0),
				};

				const res = await evalScript(
					`AE_PackageActiveCompAtomic(${JSON.stringify(opts)})`
				);
				console.log(res);
				// let res;
				// try {
				// 	res = JSON.parse(raw);
				// } catch {
				// 	res = { ok: false, error: String(raw || "bad-json") };
				// }

				if (!res.ok) {
					commit(
						"setError",
						"Ошибка упаковки: " + (res.error || "unknown")
					);
					return false;
				}

				await dispatch('categories/fetchCategories', null, { root: true });
				commit("setError", null);
				return true;
			} catch (err) {
				commit("setError", `Ошибка: ${err.message}`);
				return false;
			}
		},
		async clearError({ commit }) {
			commit("setError", "");
		},
	},

	getters: {
		getError: (s) => s.error,
	},
};
