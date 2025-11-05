// utils/image/blobCache.js
import fs from "fs/promises";
import path from "path";

const EXT2MIME = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
};

class LRU {
	constructor(limit = 100) {
		this.limit = limit;
		this.map = new Map(); // path -> url
	}
	get(k) {
		if (!this.map.has(k)) return;
		const v = this.map.get(k);
		// обновляем свежесть
		this.map.delete(k);
		this.map.set(k, v);
		return v;
	}
	set(k, v) {
		if (this.map.has(k)) this.map.delete(k);
		this.map.set(k, v);
		if (this.map.size > this.limit) {
			const [old] = this.map.keys();
			// просто удаляем ссылку из быстрых lookup, без revoke
			this.map.delete(old);
		}
	}
	delete(k) {
		// НЕ делаем revoke здесь — пусть делает Vuex cache
		this.map.delete(k);
	}
	clear() {
		// НЕ делаем revoke — Vuex cache решит, что можно
		this.map.clear();
	}
}

export const blobLRU = new LRU(80);

export async function toBlobUrl(p) {
	if (!p) return "";
	const cached = blobLRU.get(p);
	if (cached) return cached;

	const buf = await fs.readFile(p);
	const mime =
		EXT2MIME[path.extname(p).toLowerCase()] || "application/octet-stream";
	const url = URL.createObjectURL(new Blob([buf], { type: mime }));

	blobLRU.set(p, url);
	return url;
}

// Эти функции теперь только чистят индекс LRU,
// но НЕ ревокают — ревок делает Vuex cache.
export function revokePath(p) {
	blobLRU.delete(p);
}
export function clearBlobs() {
	blobLRU.clear();
}
