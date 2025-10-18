import fs from "fs";
import path from "path";
const fsp = fs.promises;

export const TRASH = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

export async function readdirNames(dir) {
	const names = await fsp.readdir(dir).catch(() => []);
	return names.filter((n) => !!n && !TRASH.has(n) && !n.startsWith("."));
}

export async function isDir(p) {
	try {
		return (await fsp.lstat(p)).isDirectory();
	} catch {
		return false;
	}
}

export function toFilesList(dir, names) {
	return names.map((name) => ({
		name,
		path: path.join(dir, name),
		format: path.extname(name).toLowerCase(),
	}));
}

export async function readdirDirs(dir) {
	try {
		const entries = await fsp.readdir(dir, { withFileTypes: true });
		return entries
			.filter(
				(e) =>
					e.isDirectory() &&
					!TRASH.has(e.name) &&
					!e.name.startsWith(".") &&
					e.name !== "manifest.json"
			)
			.map((e) => e.name);
	} catch {
		return [];
	}
}

export function toFileUrl(p) {
	const normalized = p.replace(/\\/g, "/");
	return `file:///${normalized}`;
}
