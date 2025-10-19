function _commitTmp(files) {
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		if (!f || !f.exists) continue;
		var nm = f.name.replace(/__tmp(\.[^.]+)$/i, "$1");
		if (!nm || nm === f.name) return "rename-fail:" + f.fsName;
		if (!f.rename(nm)) return "rename-fail:" + f.fsName;
	}
	return "ok";
}

export { _commitTmp };