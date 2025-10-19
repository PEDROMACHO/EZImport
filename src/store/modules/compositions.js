import fs from "fs";
import path from "path";

import { evalScript } from "cluecumber";
import { ensureUniqueDirAsync, sanitizeFsName } from "@/utils/fs/fsSafe";
import {
	readdirDirs,
	readdirNames,
	isDir,
	toFilesList,
} from "@/utils/fs/fsCommon";

const COMP_EXT = [".aep", ".mov"];
const PREVIEW_EXT = [".gif", ".png", ".jpg", ".jpeg", ".webp"];

function pickPreview(files) {
	for (const ext of PREVIEW_EXT) {
		const f = files.find((x) => x.format === ext);
		if (f) return f.path;
	}
	return null;
}

export default {
	namespaced: true,

	actions: {
		/**
		 * Загружает список композиций в категории
		 */
		async fetchCompositions({ dispatch }, categoryPath) {
			try {
				const compNames = await readdirDirs(categoryPath);

				const compositions = [];
				for (const name of compNames) {
					const full = path.join(categoryPath, name);
					const childNames = await readdirNames(full);
					const files = toFilesList(full, childNames);

					// композиция = содержит .aep или .mov
					const compFiles = files.filter((f) =>
						COMP_EXT.includes(f.format)
					);
					if (!compFiles.length) continue;

					const formats = compFiles.map((f) => f.format);
					const filesPaths = compFiles.map((f) => f.path);
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

				return compositions;
			} catch (err) {
				dispatch(
					"notifications/error",
					{ text: `Ошибка при чтении композиций: ${err.message}` },
					{ root: true }
				);
				return [];
			}
		},

		/**
		 * Загружает список файлов в директории
		 */
		async fetchFiles(_, directoryPath) {
			try {
				if (!(await isDir(directoryPath))) return [];
				const names = await readdirNames(directoryPath);
				return toFilesList(directoryPath, names);
			} catch {
				return [];
			}
		},

		/**
		 * Сохраняет активную композицию в After Effects
		 */
		async saveComposition(
			{ dispatch },
			{ compTitle, category, options = {} }
		) {
			try {
				if (!category?.path) {
					dispatch(
						"notifications/error",
						{ text: "Категория не выбрана" },
						{ root: true }
					);
					return false;
				}

				const stripExt = (s) => String(s || "").replace(/\.[^.]+$/, "");
				const baseTitle = sanitizeFsName(
					stripExt(compTitle) || "Composition"
				);

				const { dirPath: finalDir, dirName } =
					await ensureUniqueDirAsync(category.path, baseTitle);

				await fs.promises.mkdir(finalDir, { recursive: true });

				const opts = {
					destDir: finalDir.replace(/\\/g, "/"),
					title: baseTitle, // без .aep
					wantMov: !!options.mov,
					pngAtSeconds: Number(options.pngAtSeconds || 0),
				};

				const res = await evalScript(
					`AE_PackageActiveCompAtomic(${JSON.stringify(opts)})`
				);

				if (!res.ok) {
					dispatch(
						"notifications/error",
						{
							text:
								`Ошибка упаковки (${(res.error || "unknown")}): ${res.errorDetail || ""}`,
						},
						{ root: true }
					);
					return false;
				}

				await dispatch("categories/fetchCategories", null, {
					root: true,
				});
				dispatch(
					"notifications/info",
					{ text: `Композиция "${dirName}" сохранена` },
					{ root: true }
				);
				return true;
			} catch (err) {
				dispatch(
					"notifications/error",
					{ text: `Ошибка: ${err.message}` },
					{ root: true }
				);
				return false;
			}
		},
	},
};
