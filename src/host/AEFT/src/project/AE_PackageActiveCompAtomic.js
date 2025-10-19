import {
	safeName,
	ensureFolder,
	removeDirRecursive,
	prepareDestination,
} from "../core/fsUtils";
import { _opts } from "../core/jsonUtils";
import { _commitTmp } from "../core/fileOps";
import { _reopenOriginal } from "../core/projectRecovery";

var OM_PNG_NAME = "EZIMPORT_PNG";
var OM_MOV_NAME = "EZIMPORT_MOV";

function AE_PackageActiveCompAtomic(optsIn) {
	var proj = app.project;
	if (!proj) return fail("no-project", "No project open");

	var comp = proj.activeItem;
	if (!comp || !(comp instanceof CompItem))
		return fail("no-comp", "No active composition");

	var opts = _opts(optsIn);
	var destDirPath = String(opts.destDir || "");
	if (!destDirPath) return fail("no-dest", "No destination directory");

	var originalFile = proj && proj.file;

	var title = safeName(opts.title || comp.name);
	var wantMov = !!opts.wantMov;
	var pngAtSeconds =
		typeof opts.pngAtSeconds === "number" && opts.pngAtSeconds >= 0
			? opts.pngAtSeconds
			: comp.workAreaStart;

	var destDir = prepareDestination(destDirPath);
	var assetsDir = ensureFolder(destDir.fsName + "/assets");
	var backupFile = new File(
		Folder.temp.fsName + "/ae_backup_" + Date.now() + ".aep"
	);

	try {
		app.beginUndoGroup("Package Active Comp (atomic)");

		// 1. Бэкап
		backupProject(proj, backupFile);

		// 2. Урезаем проект
		reduceToActiveComp(proj, comp);

		// 3. Копируем ассеты
		copyAssets(proj, assetsDir);

		app.endUndoGroup();

		// 4. Рендер PNG (+MOV опционально)
		var outputs = renderOutputs(
			proj,
			comp,
			destDir,
			title,
			pngAtSeconds,
			wantMov
		);
		var pngFile = outputs.pngFile;
		var movFile = outputs.movFile;

		// 5. Сохраняем AEP
		var aepFinal = saveProject(proj, destDir, title);

		// 6. Финализируем временные имена (если есть)
		var okCommit = _commitTmp([]);
		if (okCommit !== "ok") throw new Error("commit-fail:" + okCommit);

		// 7. Восстанавливаем исходный проект
		_reopenOriginal(originalFile, backupFile);

		if (backupFile.exists) backupFile.remove();

		return okResult(aepFinal, pngFile, movFile);
	} catch (e) {
		_reopenOriginal(originalFile, backupFile);
		cleanup(destDir);
		return fail("error", e.message || String(e));
	} finally {
		try {
			app.endUndoGroup();
		} catch (_) {}
	}
}

/* --------------------------------- Helpers -------------------------------- */

function fail(code, msg) {
	return JSON.stringify({ ok: false, error: code, errorDetail: msg });
}

function okResult(aep, png, mov) {
	return JSON.stringify({
		ok: true,
		aepPath: aep.fsName,
		pngPath: png.fsName,
		movPath: mov ? mov.fsName : null,
	});
}

function backupProject(proj, backupFile) {
	proj.save(backupFile);
}

function reduceToActiveComp(proj, comp) {
	proj.reduceProject([comp]);
	proj.removeUnusedFootage && proj.removeUnusedFootage();
}

function copyAssets(proj, assetsDir) {
	for (var i = 1; i <= proj.numItems; i++) {
		var it = proj.item(i);
		if (it instanceof FootageItem) {
			var src = it.mainSource && it.mainSource.file;
			if (src && src.exists) {
				var tgt = uniqueTargetFile(assetsDir, src.name);
				if (!src.copy(tgt)) throw new Error("assets-copy");
				it.replace(tgt);
			}
		}
	}
}

function uniqueTargetFile(dir, name) {
	var tgt = new File(dir.fsName + "/" + name);
	if (!tgt.exists) return tgt;
	var dot = name.lastIndexOf(".");
	var base = dot > 0 ? name.substr(0, dot) : name;
	var ext = dot > 0 ? name.substr(dot) : "";
	var k = 2;
	do {
		tgt = new File(dir.fsName + "/" + base + "_" + k + ext);
		k++;
	} while (tgt.exists);
	return tgt;
}

function renderOutputs(proj, comp, destDir, title, pngAtSeconds, wantMov) {
	var rq = proj.renderQueue;

	// PNG
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
	ensureTemplate(omPng, OM_PNG_NAME);
	omPng.applyTemplate(OM_PNG_NAME);
	omPng.file = new File(destDir.fsName + "/preview_[#####].png");
	qiPng.render = true;

	// MOV (опционально)
	var movFile = null;
	var qiMov = null;
	if (wantMov) {
		qiMov = rq.items.add(comp);
		qiMov.setSettings({ Quality: "Best", Resolution: "Full" });
		var omMov = qiMov.outputModule(1);
		ensureTemplate(omMov, OM_MOV_NAME);
		omMov.applyTemplate(OM_MOV_NAME);
		movFile = new File(destDir.fsName + "/" + title + ".mov");
		omMov.file = movFile;
		qiMov.render = true;
	}

	var ok = rq.render();
	// alert("Render queue finished with status: " + ok);
	// if (!ok) throw new Error("rq-fail");

	try {
		qiPng.remove();
	} catch (_) {}
	try {
		qiMov && qiMov.remove();
	} catch (_) {}

	var seqList = destDir.getFiles(function (f) {
		return f instanceof File && /^preview_\d+\.png$/i.test(f.name);
	});
	if (!seqList || seqList.length !== 1) throw new Error("png-missing");

	var pngFinal = new File(destDir.fsName + "/preview.png");
	if (pngFinal.exists)
		try {
			pngFinal.remove();
		} catch (_) {}
	seqList[0].copy(pngFinal.fsName);
	try {
		seqList[0].remove();
	} catch (_) {}

	return { pngFile: pngFinal, movFile: movFile };
}

function ensureTemplate(om, templateName) {
	var ts = om.templates;
	for (var i = 0; i < ts.length; i++) {
		if (String(ts[i]) === templateName) return;
	}
	throw new Error(templateName + "-om-missing");
}

function saveProject(proj, destDir, title) {
	var aepFinal = new File(destDir.fsName + "/" + title + ".aep");
	proj.save(aepFinal);
	return aepFinal;
}

function cleanup(destDir) {
	try {
		removeDirRecursive(destDir);
	} catch (_) {}
}

export { AE_PackageActiveCompAtomic };
