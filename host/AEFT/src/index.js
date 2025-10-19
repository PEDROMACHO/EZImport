// index.js

import { AE_ImportFile } from "./import/AE_ImportFile";

import { AE_OpenFolder } from "./project/AE_OpenFolder";
import { AE_HasActiveComp } from "./project/AE_HasActiveComp";
import { AE_GetActiveCompName } from "./project/AE_GetActiveCompName";
import { AE_PackageActiveCompAtomic } from "./project/AE_PackageActiveCompAtomic";

import { safeName, ensureFolder, removeDirRecursive } from "./core/fsUtils";
import { _opts } from "./core/jsonUtils";
import { _commitTmp } from "./core/fileOps";
import { _reopenOriginal } from "./core/projectRecovery";

// Собираем всё в единый объект API
var AEFT = {
	AE_OpenFolder,
	AE_ImportFile,
	AE_HasActiveComp,
	AE_GetActiveCompName,
	AE_PackageActiveCompAtomic,

	safeName,
	ensureFolder,
	removeDirRecursive,
	_opts,
	_commitTmp,
	_reopenOriginal,
};

// Вешаем на глобал, чтобы доступно было из панели
$.global.AEFT = AEFT;

// Дополнительно можно развернуть каждую функцию в глобал напрямую
for (var key in AEFT) {
	if (typeof AEFT[key] === "function") {
		$.global[key] = AEFT[key];
	}
}
