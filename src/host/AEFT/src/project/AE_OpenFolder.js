function AE_OpenFolder(path) {
	try {
		var f = new File(path);
		if (f.exists) {
			var folder = f;
			if (folder && folder.exists) {
				folder.execute(); // откроет папку в проводнике/файндере
				return "ok";
			}
		}
		return "not-found";
	} catch (e) {
		return "error:" + e.toString();
	}
}

export { AE_OpenFolder };