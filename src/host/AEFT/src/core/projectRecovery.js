function _reopenOriginal(originalFile, backupFile) {
	try { app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES); } catch (_) { }

	try {
		if (originalFile && originalFile.exists) {
			app.open(originalFile);
			return true;
		}
	} catch (_) { }

	try {
		if (backupFile && backupFile.exists) {
			app.open(backupFile);
			return true;
		}
	} catch (_) { }

	return false;
}

export { _reopenOriginal };