/* Compiled host.jsx for ExtendScript */
(function() {
  // src/host/AEFT/src/import/AE_ImportFile.js
  function AE_ImportFile(filePath) {
    var sourceFile = new File(filePath);
    if (!sourceFile.exists) return "no-file";
    var extension = (/\.[^\.]+$/.exec(sourceFile.name) || [
      ""
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
          var baseName = sourceFile.displayName.replace(/\.[^\.]+$/, "");
          importedFolder.name = baseName;
          var innerFolderInfo = findSingleInnerFolder(importedFolder);
          if (innerFolderInfo && !isSolidsFolder(innerFolderInfo.folder)) {
            var children = listChildren(innerFolderInfo.folder);
            for (var k = 0; k < children.length; k++) {
              children[k].parentFolder = importedFolder;
            }
            try {
              innerFolderInfo.folder.remove();
            } catch (_) {
            }
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
  function findSingleInnerFolder(parentFolder) {
    var count = 0, found = null;
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
    var arr = [];
    for (var i = 1; i <= app.project.numItems; i++) {
      var it = app.project.item(i);
      if (it.parentFolder === folder) arr.push(it);
    }
    return arr;
  }
  function isSolidsFolder(folder) {
    if (folder.name !== "Solids") return false;
    var kids = listChildren(folder);
    if (kids.length === 0) return true;
    for (var i = 0; i < kids.length; i++) {
      var it = kids[i];
      if (!(it instanceof FootageItem)) return false;
      if (!(it.mainSource && it.mainSource instanceof SolidSource))
        return false;
    }
    return true;
  }

  // src/host/AEFT/src/project/AE_OpenFolder.js
  function AE_OpenFolder(path) {
    try {
      var f = new File(path);
      if (f.exists) {
        var folder = f;
        if (folder && folder.exists) {
          folder.execute();
          return "ok";
        }
      }
      return "not-found";
    } catch (e) {
      return "error:" + e.toString();
    }
  }

  // src/host/AEFT/src/project/AE_HasActiveComp.js
  function AE_HasActiveComp() {
    try {
      if (!app.project) return "0";
      var it = app.project.activeItem;
      return it && it instanceof CompItem ? "1" : "0";
    } catch (e) {
      return "0";
    }
  }

  // src/host/AEFT/src/project/AE_GetActiveCompName.js
  function AE_GetActiveCompName() {
    try {
      var it = app.project && app.project.activeItem;
      return it && it instanceof CompItem ? it.name : "";
    } catch (e) {
      return "";
    }
  }

  // src/host/AEFT/src/core/fsUtils.js
  function safeName(s) {
    s = String(s).replace(/[<>:"\/\\|?*\u0000-\u001F]+/g, " ").replace(/\s+/g, " ").replace(/\.+$/, "").replace(/^\s+|\s+$/g, "");
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(s)) s += "-item";
    return s || "untitled";
  }
  function ensureFolder(p) {
    var f = new Folder(p);
    if (!f.exists) f.create();
    return f;
  }
  function removeDirRecursive(dir) {
    if (!dir || !(dir instanceof Folder) || !dir.exists) return;
    var items = dir.getFiles();
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      try {
        if (it instanceof Folder) removeDirRecursive(it);
        else if (it instanceof File && it.exists) it.remove();
      } catch (_) {
      }
    }
    try {
      dir.remove();
    } catch (_) {
    }
  }
  function prepareDestination(path) {
    var dir = new Folder(path);
    if (dir.exists) removeDirRecursive(dir);
    dir.create();
    return dir;
  }

  // src/host/AEFT/src/core/jsonUtils.js
  function _opts(o) {
    if (o && typeof o === "object") return o;
    try {
      return JSON.parse(o);
    } catch (_) {
      return {};
    }
  }

  // src/host/AEFT/src/core/fileOps.js
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

  // src/host/AEFT/src/core/projectRecovery.js
  function _reopenOriginal(originalFile, backupFile) {
    try {
      app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
    } catch (_) {
    }
    try {
      if (originalFile && originalFile.exists) {
        app.open(originalFile);
        return true;
      }
    } catch (_) {
    }
    try {
      if (backupFile && backupFile.exists) {
        app.open(backupFile);
        return true;
      }
    } catch (_) {
    }
    return false;
  }

  // src/host/AEFT/src/project/AE_PackageActiveCompAtomic.js
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
    var pngAtSeconds = typeof opts.pngAtSeconds === "number" && opts.pngAtSeconds >= 0 ? opts.pngAtSeconds : comp.workAreaStart;
    var destDir = prepareDestination(destDirPath);
    var assetsDir = ensureFolder(destDir.fsName + "/assets");
    var backupFile = new File(
      Folder.temp.fsName + "/ae_backup_" + Date.now() + ".aep"
    );
    try {
      app.beginUndoGroup("Package Active Comp (atomic)");
      backupProject(proj, backupFile);
      reduceToActiveComp(proj, comp);
      copyAssets(proj, assetsDir);
      app.endUndoGroup();
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
      var aepFinal = saveProject(proj, destDir, title);
      var okCommit = _commitTmp([]);
      if (okCommit !== "ok") throw new Error("commit-fail:" + okCommit);
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
      } catch (_) {
      }
    }
  }
  function fail(code, msg) {
    return JSON.stringify({ ok: false, error: code, errorDetail: msg });
  }
  function okResult(aep, png, mov) {
    return JSON.stringify({
      ok: true,
      aepPath: aep.fsName,
      pngPath: png.fsName,
      movPath: mov ? mov.fsName : null
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
      "Time Span Duration": String(fd)
    });
    var omPng = qiPng.outputModule(1);
    ensureTemplate(omPng, OM_PNG_NAME);
    omPng.applyTemplate(OM_PNG_NAME);
    omPng.file = new File(destDir.fsName + "/preview_[#####].png");
    qiPng.render = true;
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
    try {
      qiPng.remove();
    } catch (_) {
    }
    try {
      qiMov && qiMov.remove();
    } catch (_) {
    }
    var seqList = destDir.getFiles(function(f) {
      return f instanceof File && /^preview_\d+\.png$/i.test(f.name);
    });
    if (!seqList || seqList.length !== 1) throw new Error("png-missing");
    var pngFinal = new File(destDir.fsName + "/preview.png");
    if (pngFinal.exists)
      try {
        pngFinal.remove();
      } catch (_) {
      }
    seqList[0].copy(pngFinal.fsName);
    try {
      seqList[0].remove();
    } catch (_) {
    }
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
    } catch (_) {
    }
  }

  // src/host/AEFT/src/index.js
  var AEFT = {
    AE_OpenFolder: AE_OpenFolder,
    AE_ImportFile: AE_ImportFile,
    AE_HasActiveComp: AE_HasActiveComp,
    AE_GetActiveCompName: AE_GetActiveCompName,
    AE_PackageActiveCompAtomic: AE_PackageActiveCompAtomic,
    safeName: safeName,
    ensureFolder: ensureFolder,
    removeDirRecursive: removeDirRecursive,
    _opts: _opts,
    _commitTmp: _commitTmp,
    _reopenOriginal: _reopenOriginal
  };
  $.global.AEFT = AEFT;
  for (key in AEFT) {
    if (typeof AEFT[key] === "function") {
      $.global[key] = AEFT[key];
    }
  }
  var key;
})();
/* End of host.jsx */
