// Универсальная очистка имени папки/файла (Windows-safe, cross-platform)
import fs from "fs";
import path from "path";

const ILLEGAL = /[<>:"/\\|?*\x00-\x1F]/g; // запрещённые Win-символы + control
const DOTS_SPACES_EDGES = /^[.\s]+|[.\s]+$/g; // точки/пробелы в начале/конце
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i; // зарезервированные имена

function clipByBytes(str, maxBytes = 240) {
	// ограничиваем компонент до ~240 байт UTF-8, чтобы не поймать 255+ на NTFS
	let out = "";
	let bytes = 0;
	for (const ch of str) {
		const b = Buffer.byteLength(ch, "utf8");
		if (bytes + b > maxBytes) break;
		out += ch;
		bytes += b;
	}
	return out;
}

export function sanitizeFsName(input, replacement = "-") {
	let s = String(input || "")
		.normalize("NFKC") // унификация юникода
		.replace(ILLEGAL, replacement) // запрещённые символы
		.replace(/\s+/g, " ") // схлопываем пробелы
		.replace(/-{2,}/g, "-") // схлопываем подряд идущие дефисы
		.trim()
		.replace(DOTS_SPACES_EDGES, ""); // убираем точки/пробелы по краям

	if (s === "." || s === ".." || RESERVED.test(s)) s = `${s}-item`;
	s = clipByBytes(s, 240);
	if (!s) s = "untitled";
	return s;
}

// Возвращает путь и имя, уникализируя " (2)", " (3)" при коллизиях
export function ensureUniqueDir(baseDir, desiredName) {
	const safe = sanitizeFsName(desiredName);
	let name = safe;
	let i = 2;
	let p = path.join(baseDir, name);
	while (fs.existsSync(p)) {
		name = `${safe} (${i++})`;
		p = path.join(baseDir, name);
	}
	return { dirPath: p, dirName: name, safeBaseName: safe };
}

export async function ensureUniqueDirAsync(baseDir, desiredName) {
	const safe = sanitizeFsName(desiredName);
	let name = safe;
	let i = 2;
	let p = path.join(baseDir, name);

	// проверяем существование асинхронно
	while (
		await fs.promises
			.stat(p)
			.then(() => true)
			.catch(() => false)
	) {
		name = `${safe} (${i++})`;
		p = path.join(baseDir, name);
	}

	return { dirPath: p, dirName: name, safeBaseName: safe };
}
