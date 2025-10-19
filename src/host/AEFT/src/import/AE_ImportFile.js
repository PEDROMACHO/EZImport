function AE_ImportFile(filePath) {
	var sourceFile = new File(filePath);
	if (!sourceFile.exists) return "no-file";

	// Определяем расширение
	var extensionMatch = /\.[^\.]+$/.exec(sourceFile.name);
	var extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";

	var importOptions = new ImportOptions(sourceFile);

	// Импорт проекта AEP
	if (extension === ".aep") {
		importOptions.importAs = ImportAsType.PROJECT;
		if (!importOptions.canImportAs(ImportAsType.PROJECT)) {
			return "cant-import-project";
		}

		var importedFolder = app.project.importFile(importOptions);
		if (importedFolder instanceof FolderItem) {
			// Переименовываем контейнер в имя файла без расширения
			var baseName = sourceFile.displayName.replace(/\.[^\.]+$/, "");
			importedFolder.name = baseName;

			// Проверяем, есть ли внутри ровно одна вложенная папка
			var innerFolder = null;
			var innerCount = 0;
			for (var i = 1; i <= app.project.numItems; i++) {
				var item = app.project.item(i);
				if (
					item.parentFolder === importedFolder &&
					item instanceof FolderItem
				) {
					innerCount++;
					innerFolder = item;
				}
			}

			// Если есть одна вложенная папка — распаковываем её содержимое
			if (innerCount === 1 && innerFolder) {
				for (var j = 1; j <= app.project.numItems; j++) {
					var nestedItem = app.project.item(j);
					if (nestedItem.parentFolder === innerFolder) {
						nestedItem.parentFolder = importedFolder;
					}
				}
				try {
					innerFolder.remove();
				} catch (_) {}
			}
		}
		return "ok";
	}

	// Импорт видео (MOV)
	if (extension === ".mov") {
		importOptions.importAs = ImportAsType.FOOTAGE;
		if (!importOptions.canImportAs(ImportAsType.FOOTAGE)) {
			return "cant-import-footage";
		}
		app.project.importFile(importOptions);
		return "ok";
	}

	return "unsupported";
}

export { AE_ImportFile };
