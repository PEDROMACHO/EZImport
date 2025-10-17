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
		this.map = new Map();
	}
	get(k) {
		if (!this.map.has(k)) return;
		const v = this.map.get(k);
		this.map.delete(k);
		this.map.set(k, v);
		return v;
	}
	set(k, v) {
		if (this.map.has(k)) this.map.delete(k);
		this.map.set(k, v);
		if (this.map.size > this.limit) {
			const [old] = this.map.keys();
			this.delete(old);
		}
	}
	delete(k) {
		const url = this.map.get(k);
		if (url) URL.revokeObjectURL(url);
		this.map.delete(k);
	}
	clear() {
		for (const [, url] of this.map) URL.revokeObjectURL(url);
		this.map.clear();
	}
}

export const blobLRU = new LRU(80); // держим ~80 одновременно

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
export function revokePath(p) {
	blobLRU.delete(p);
}
export function clearBlobs() {
	blobLRU.clear();
}
