import fs from "fs";
import path from "path";
import { readdirDirs, readdirNames, toFilesList } from "@/utils/fs/fsCommon";

const COMP_EXT = [".aep", ".mov"];
const PREVIEW_EXT = [".gif", ".png", ".jpg", ".jpeg", ".webp"];

const atomicWrite = (p, s) => {
	fs.writeFileSync(p + ".tmp", s, "utf8");
	fs.renameSync(p + ".tmp", p);
};
const pickPreview = (files, preview_ext) => {
	for (const ext of preview_ext) {
		const f = files.find((x) => x.format === ext);
		if (f) return f.path;
	}
	return null;
};

const sortCategories = (cats) =>
	cats.sort((a, b) => a.name.localeCompare(b.name));

const norm = (p) => path.normalize(p); // одинаковые ключи на Win/Mac

/**
 * Сканирует категорию и возвращает список элементов
 * @param {string} categoryPath
 * @returns {Promise<Array<{name:string,path:string,files:string[],formats:string[],previewPath:string|null}>>}
 */
async function scanCategoryItems(categoryPath) {
	const dirs = await readdirDirs(categoryPath).catch(() => []);
	const items = [];

	for (const name of dirs) {
		const compDir = norm(path.join(categoryPath, name));
		const names = await readdirNames(compDir).catch(() => []);
		const files = toFilesList(compDir, names);

		const comps = files.filter((f) => COMP_EXT.includes(f.format));
		if (!comps.length) continue;

		items.push({
			name,
			path: compDir,
			filesPaths: comps.map((f) => f.path),
			formats: comps.map((f) => f.format),
			previewPath: pickPreview(files, PREVIEW_EXT),
		});
	}
	return items;
}

function createManifestShape(rootDir, data = null) {
	return {
		version: 1,
		updated: data?.updated || new Date().toISOString(),
		rootDir,
		categories: Array.isArray(data?.categories) ? data.categories : [],
		itemsByCategory: data?.itemsByCategory || {},
	};
}

export {
	norm,
	atomicWrite,
	pickPreview,
	sortCategories,
	scanCategoryItems,
	createManifestShape,
};
