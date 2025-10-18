function safeName(s) {
	s = String(s)
		.replace(/[<>:"\/\\|?*\u0000-\u001F]+/g, " ")
		.replace(/\s+/g, " ")
		.replace(/\.+$/, "")
		.replace(/^\s+|\s+$/g, "");
	if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(s)) s += "-item";
	return s || "untitled";
}

function ensureFolder(p) {
	var f = new Folder(p);
	if (!f.exists) f.create();
	return f;
}

function removeDirRecursive(dir) {
	if (!dir || !(dir instanceof Folder) || !dir.exists) return;
	var items = dir.getFiles();
	for (var i = 0; i < items.length; i++) {
		var it = items[i];
		try {
			if (it instanceof Folder) removeDirRecursive(it);
			else if (it instanceof File && it.exists) it.remove();
		} catch (_) {}
	}
	try {
		dir.remove();
	} catch (_) {}
}

export { safeName, ensureFolder, removeDirRecursive };
