import { safeName, ensureFolder, removeDirRecursive } from "../core/fsUtils";
import { _opts } from "../core/jsonUtils";
import { _commitTmp } from "../core/fileOps";
import { _reopenOriginal } from "../core/projectRecovery";

function AE_PackageActiveCompAtomic(optsIn) {
	var proj = app.project;
	var originalFile = proj && proj.file;
	var undoOpen = false;

	if (!proj) {
		alert("No project open");
		return JSON.stringify({ ok: false, error: "no-project" });
	}

	var comp = proj.activeItem;
	if (!comp || !(comp instanceof CompItem)) {
		alert("No active composition");
		return JSON.stringify({ ok: false, error: "no-comp" });
	}

	var opts = _opts(optsIn);
	var destDirPath = String(opts.destDir || "");
	if (!destDirPath) {
		alert("No destination directory");
		return JSON.stringify({ ok: false, error: "no-dest" });
	}

	var title = safeName(opts.title || comp.name);
	var wantMov = !!opts.wantMov;
	var pngAtSeconds =
		typeof opts.pngAtSeconds === "number" && opts.pngAtSeconds >= 0
			? opts.pngAtSeconds
			: comp.workAreaStart;

	// 1 папка = 1 композиция: жёстко чистим и создаём
	var destDir = new Folder(destDirPath);
	if (destDir.exists) removeDirRecursive(destDir);
	destDir.create();
	var assetsDir = ensureFolder(destDir.fsName + "/assets");

	var tmpOutputs = [];
	var createdAssets = [];
	var backupFile = new File(
		Folder.temp.fsName + "/ae_backup_" + Date.now() + ".aep"
	);

	try {
		app.beginUndoGroup("Package Active Comp (atomic)");
		undoOpen = true;

		// Бэкап для отката
		proj.save(backupFile);

		// Урезаем проект до активной композиции
		proj.reduceProject([comp]);
		proj.removeUnusedFootage && proj.removeUnusedFootage();

		// Копируем ассеты и реплейсим ссылки
		for (var i = 1; i <= proj.numItems; i++) {
			var it = proj.item(i);
			if (it instanceof FootageItem) {
				try {
					var src = it.mainSource && it.mainSource.file;
					if (src && src.exists) {
						var tgt = new File(assetsDir.fsName + "/" + src.name);
						if (tgt.exists) {
							var dot = src.name.lastIndexOf(".");
							var base =
								dot > 0 ? src.name.substr(0, dot) : src.name;
							var ext = dot > 0 ? src.name.substr(dot) : "";
							var k = 2;
							do {
								tgt = new File(
									assetsDir.fsName +
										"/" +
										base +
										"_" +
										k +
										ext
								);
								k++;
							} while (tgt.exists);
						}
						if (!src.copy(tgt)) {
							// Ошибка — чистим папку и откатываемся
							try {
								removeDirRecursive(destDir);
							} catch (_) {}
							_reopenOriginal(originalFile, backupFile);
							alert("Failed to copy asset: " + src.fsName);
							return JSON.stringify({
								ok: false,
								error: "assets-copy",
							});
						}
						it.replace(tgt);
						createdAssets.push(tgt);
					}
				} catch (e) {
					try {
						removeDirRecursive(destDir);
					} catch (_) {}
					_reopenOriginal(originalFile, backupFile);
					alert("Failed to copy asset " + ((e && e.message) || e));
					return JSON.stringify({
						ok: false,
						error: "assets:" + ((e && e.message) || e),
					});
				}
			}
		}

		// --- Сначала RQ (PNG + MOV), потом сохраняем AEP. Без __tmp ---
		if (undoOpen) {
			app.endUndoGroup();
			undoOpen = false;
		}

		var OM_PNG_NAME = "EZIMPORT_PNG";
		var OM_MOV_NAME = "EZIMPORT_MOV";

		var rq = proj.renderQueue;

		// 1 кадр для PNG
		var fd = comp.frameDuration;
		var tClamp = Math.max(
			0,
			Math.min(pngAtSeconds, Math.max(0, comp.duration - fd))
		);

		var qiPng = rq.items.add(comp);
		qiPng.setSettings({
			Quality: "Best",
			Resolution: "Full",
			"Time Span Start": String(tClamp),
			"Time Span Duration": String(fd),
		});

		var omPng = qiPng.outputModule(1);
		var tsPng = omPng.templates,
			hasPng = false;

		for (var i = 0; i < tsPng.length; i++) {
			if (String(tsPng[i]) === OM_PNG_NAME) {
				hasPng = true;
				break;
			}
		}
		if (!hasPng) {
			try {
				removeDirRecursive(destDir);
			} catch (_) {}
			_reopenOriginal(originalFile, backupFile);
			alert(
				"Не найден Output Module шаблон '" +
					OM_PNG_NAME +
					"'. Загрузите .aom и повторите."
			);
			return JSON.stringify({ ok: false, error: "png-om-missing" });
		}
		omPng.applyTemplate(OM_PNG_NAME);
		omPng.file = new File(destDir.fsName + "/preview_[#####].png");
		qiPng.render = true;

		// MOV (опционально, тем же способом)
		var qiMov = null,
			movFile = null;
		if (wantMov) {
			qiMov = rq.items.add(comp);
			qiMov.setSettings({ Quality: "Best", Resolution: "Full" });
			var omMov = qiMov.outputModule(1);
			var tsMov = omMov.templates,
				hasMov = false;
			for (var j = 0; j < tsMov.length; j++) {
				if (String(tsMov[j]) === OM_MOV_NAME) {
					hasMov = true;
					break;
				}
			}
			if (!hasMov) {
				try {
					removeDirRecursive(destDir);
				} catch (_) {}
				_reopenOriginal(originalFile, backupFile);
				alert(
					"Не найден Output Module шаблон '" +
						OM_MOV_NAME +
						"'. Загрузите .aom и повторите."
				);
				return JSON.stringify({ ok: false, error: "mov-om-missing" });
			}
			omMov.applyTemplate(OM_MOV_NAME);
			movFile = new File(destDir.fsName + "/" + title + ".mov");
			omMov.file = movFile;
			qiMov.render = true;
		}

		// Рендер всей очереди
		var okRQ = rq.render();

		// Уборка RQ-элементов
		try {
			qiPng.remove && qiPng.remove();
		} catch (_) {}
		try {
			qiMov && qiMov.remove && qiMov.remove();
		} catch (_) {}

		// if (!okRQ) {
		// 	try {
		// 		removeDirRecursive(destDir);
		// 	} catch (_) {}
		// 	_reopenOriginal(originalFile, backupFile);
		// 	alert("Failed to render queue");
		// 	return JSON.stringify({ ok: false, error: "rq-fail" });
		// }

		// Найти единственный PNG из последовательности и переименовать в preview.png
		var seqList = destDir.getFiles(function (f) {
			return f instanceof File && /^preview_\d+\.png$/i.test(f.name);
		});
		if (!seqList || seqList.length !== 1) {
			try {
				removeDirRecursive(destDir);
			} catch (_) {}
			_reopenOriginal(originalFile, backupFile);
			alert("PNG not found after render");
			return JSON.stringify({ ok: false, error: "png-missing" });
		}
		var pngFinal = new File(destDir.fsName + "/preview.png");
		if (pngFinal.exists) {
			try {
				pngFinal.remove();
			} catch (_) {}
		}
		seqList[0].copy(pngFinal.fsName);
		try {
			seqList[0].remove();
		} catch (_) {}

		// Теперь сохраняем AEP сразу финальным именем
		var aepFinal = new File(destDir.fsName + "/" + title + ".aep");
		proj.save(aepFinal);

		// Атомарный коммит временных имён
		var okCommit = _commitTmp(tmpOutputs);
		if (okCommit !== "ok") {
			try {
				removeDirRecursive(destDir);
			} catch (_) {}
			_reopenOriginal(originalFile, backupFile);
			alert("Failed to finalize output files: " + okCommit);
			return JSON.stringify({ ok: false, error: okCommit });
		}

		// Возвращаем исходный проект и чистим бэкап
		_reopenOriginal(originalFile, backupFile);
		try {
			if (backupFile && backupFile.exists) backupFile.remove();
		} catch (_) {}

		return JSON.stringify({
			ok: true,
			aepPath: aepFinal.fsName.replace(/__tmp\.aep$/, ".aep"),
			pngPath: pngFinal.fsName.replace(/__tmp\.png$/, ".png"),
			movPath: movFile ? movFile.fsName.replace(/__tmp\.mov$/, ".mov") : null
		});
	} catch (e) {
		// Общая ошибка: чистим папку, закрываем undo, откатываем проект
		try {
			removeDirRecursive(destDir);
		} catch (_) {}
		if (undoOpen) {
			try {
				app.endUndoGroup();
			} catch (_) {}
			undoOpen = false;
		}
		try {
			_reopenOriginal(originalFile, backupFile);
		} catch (_) {}

		alert("Error: " + ((e && e.message) || e));
		return JSON.stringify({
			ok: false,
			error: String((e && e.message) || e),
		});
	} finally {
		if (undoOpen) {
			try {
				app.endUndoGroup();
			} catch (_) {}
		}
	}
}

export { AE_PackageActiveCompAtomic };
