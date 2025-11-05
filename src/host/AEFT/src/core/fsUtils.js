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
    if (!f.exists) {
        if (!f.create()) {
            throw new Error("cannot-create-folder: " + p);
        }
    }
    return f;
}

/**
 * Prepares a destination directory for an AE project
 * by removing any existing contents and creating the directory
 * if it doesn't already exist.
 * @param {string} path The path to the destination directory
 * @returns {Folder} The prepared destination directory
 */
function prepareDestination(path) {
    var dir = new Folder(path);
    if (dir.exists) removeDirRecursive(dir);
    if (!dir.create()) {
        throw new Error("cannot-create-destDir: " + path);
    }
    return dir;
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

export { safeName, ensureFolder, removeDirRecursive, prepareDestination };
