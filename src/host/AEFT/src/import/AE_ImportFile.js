// function AE_ImportFile(filePath) {
// 	var sourceFile = new File(filePath);
// 	if (!sourceFile.exists) return "no-file";

// 	// Определяем расширение
// 	var extensionMatch = /\.[^\.]+$/.exec(sourceFile.name);
// 	var extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";

// 	var importOptions = new ImportOptions();
// 	importOptions.file = sourceFile;
// 	// importOptions.sequence = true;

// 	// Импорт проекта AEP
// 	if (extension === ".aep") {
// 		importOptions.importAs = ImportAsType.PROJECT;
// 		if (!importOptions.canImportAs(ImportAsType.PROJECT)) {
// 			return "cant-import-project";
// 		}

// 		var importedFolder = app.project.importFile(importOptions);
// 		if (importedFolder instanceof FolderItem) {
// 			// Переименовываем контейнер в имя файла без расширения
// 			var baseName = sourceFile.displayName.replace(/\.[^\.]+$/, "");
// 			importedFolder.name = baseName;

// 			// Проверяем, есть ли внутри ровно одна вложенная папка
// 			var innerFolder = null;
// 			var innerCount = 0;
// 			for (var i = 1; i <= app.project.numItems; i++) {
// 				var item = app.project.item(i);
// 				if (
// 					item.parentFolder === importedFolder &&
// 					item instanceof FolderItem
// 				) {
// 					innerCount++;
// 					innerFolder = item;
// 				}
// 			}

// 			// Если есть одна вложенная папка — распаковываем её содержимое
// 			if (innerCount === 1 && innerFolder) {
// 				for (var j = 1; j <= app.project.numItems; j++) {
// 					var nestedItem = app.project.item(j);
// 					if (nestedItem.parentFolder === innerFolder) {
// 						nestedItem.parentFolder = importedFolder;
// 					}
// 				}
// 				try {
// 					innerFolder.remove();
// 				} catch (_) {}
// 			}
// 		}

// 		return "ok";
// 	}

// 	// Импорт видео (MOV)
// 	if (extension === ".mov") {
// 		importOptions.importAs = ImportAsType.FOOTAGE;
// 		if (!importOptions.canImportAs(ImportAsType.FOOTAGE)) {
// 			return "cant-import-footage";
// 		}
// 		app.project.importFile(importOptions);
// 		return "ok";
// 	}

// 	return "unsupported";
// }

// export { AE_ImportFile };

function AE_ImportFile(filePath) {
	var sourceFile = new File(filePath);
	if (!sourceFile.exists) return "no-file";

	var extension = (/\.[^\.]+$/.exec(sourceFile.name) || [
		"",
	])[0].toLowerCase();
	var importOptions = new ImportOptions();
	importOptions.file = sourceFile;

	app.beginUndoGroup("AE_ImportFile");
	try {
		if (extension === ".aep") {
			importOptions.importAs = ImportAsType.PROJECT;
			if (!importOptions.canImportAs(ImportAsType.PROJECT))
				return "cant-import-project";

			var importedFolder = app.project.importFile(importOptions);

			if (importedFolder instanceof FolderItem) {
				// 1) Переименуем корень импорта
				var baseName = sourceFile.displayName.replace(/\.[^\.]+$/, "");
				importedFolder.name = baseName;

				// 2) Осторожная распаковка только если это НЕ Solids и НЕ «папка из солидов»
				var innerFolderInfo = findSingleInnerFolder(importedFolder);
				if (
					innerFolderInfo &&
					!isSolidsFolder(innerFolderInfo.folder)
				) {
					// Снимок детей, чтобы не ловить смену коллекции при переносе
					var children = listChildren(innerFolderInfo.folder);
					for (var k = 0; k < children.length; k++) {
						children[k].parentFolder = importedFolder;
					}
					// Попробуем удалить пустую папку
					try {
						innerFolderInfo.folder.remove();
					} catch (_) {}
				}
			}

			return "ok";
		}

		if (extension === ".mov") {
			importOptions.importAs = ImportAsType.FOOTAGE;
			if (!importOptions.canImportAs(ImportAsType.FOOTAGE))
				return "cant-import-footage";
			app.project.importFile(importOptions);
			return "ok";
		}

		return "unsupported";
	} finally {
		app.endUndoGroup();
	}
}

/* --------------------------------- Helpers -------------------------------- */

function findSingleInnerFolder(parentFolder) {
	// Считаем только ПРЯМЫХ детей этого FolderItem
	var count = 0,
		found = null;
	var kids = listChildren(parentFolder);
	for (var i = 0; i < kids.length; i++) {
		if (kids[i] instanceof FolderItem) {
			count++;
			found = kids[i];
		}
	}
	return count === 1 ? { folder: found } : null;
}

function listChildren(folder) {
	// Надёжный список прямых детей этого FolderItem
	var arr = [];
	// В AE у FolderItem нет собственного итератора, поэтому фильтруем по parentFolder
	for (var i = 1; i <= app.project.numItems; i++) {
		var it = app.project.item(i);
		if (it.parentFolder === folder) arr.push(it);
	}
	return arr;
}

function isSolidsFolder(folder) {
	// True если папка называется "Solids" И содержит только FootageItem с SolidSource
	if (folder.name !== "Solids") return false;
	var kids = listChildren(folder);
	if (kids.length === 0) return true; // пустую "Solids" тоже не трогаем
	for (var i = 0; i < kids.length; i++) {
		var it = kids[i];
		if (!(it instanceof FootageItem)) return false;
		if (!(it.mainSource && it.mainSource instanceof SolidSource))
			return false;
	}
	return true;
}

export { AE_ImportFile };
