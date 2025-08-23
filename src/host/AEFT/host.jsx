function importFile(path, importType) {
	var importOptions = new ImportOptions(new File(path));
	var importAs;

	switch (importType) {
		case ".aep":
			importAs = ImportAsType.PROJECT;
			break;
		case ".mov":
			importAs = ImportAsType.FOOTAGE;
			break;
		default:
			importAs = ImportAsType.PROJECT;
			break;
	};

	if (importOptions.canImportAs(importAs)) {
		var importedFile = app.project.importFile(importOptions);
		// alert(`Project imported successfully`);
	} else {
		alert('Failed to import project');
	}
};