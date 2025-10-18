/* Compiled host.jsx for ExtendScript */
(function() {
  // src/host/AEFT/src/import/AE_ImportFile.js
  function AE_ImportFile(filePath) {
    var sourceFile = new File(filePath);
    if (!sourceFile.exists) return "no-file";
    var extensionMatch = /\.[^\.]+$/.exec(sourceFile.name);
    var extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";
    var importOptions = new ImportOptions(sourceFile);
    if (extension === ".aep") {
      importOptions.importAs = ImportAsType.PROJECT;
      if (!importOptions.canImportAs(ImportAsType.PROJECT)) {
        return "cant-import-project";
      }
      var importedFolder = app.project.importFile(importOptions);
      if (importedFolder instanceof FolderItem) {
        var baseName = sourceFile.displayName.replace(/\.[^\.]+$/, "");
        importedFolder.name = baseName;
        var innerFolder = null;
        var innerCount = 0;
        for (var i = 1; i <= app.project.numItems; i++) {
          var item = app.project.item(i);
          if (item.parentFolder === importedFolder && item instanceof FolderItem) {
            innerCount++;
            innerFolder = item;
          }
        }
        if (innerCount === 1 && innerFolder) {
          for (var j = 1; j <= app.project.numItems; j++) {
            var nestedItem = app.project.item(j);
            if (nestedItem.parentFolder === innerFolder) {
              nestedItem.parentFolder = importedFolder;
            }
          }
          try {
            innerFolder.remove();
          } catch (_) {
          }
        }
      }
      return "ok";
    }
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

  // src/host/AEFT/src/project/AE_GetActiveCompName.js
  function AE_GetActiveCompName() {
    try {
      var it = app.project && app.project.activeItem;
      return it && it instanceof CompItem ? it.name : "";
    } catch (e) {
      return "";
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
    var pngAtSeconds = typeof opts.pngAtSeconds === "number" && opts.pngAtSeconds >= 0 ? opts.pngAtSeconds : comp.workAreaStart;
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
      proj.save(backupFile);
      proj.reduceProject([comp]);
      proj.removeUnusedFootage && proj.removeUnusedFootage();
      for (var i = 1; i <= proj.numItems; i++) {
        var it = proj.item(i);
        if (it instanceof FootageItem) {
          try {
            var src = it.mainSource && it.mainSource.file;
            if (src && src.exists) {
              var tgt = new File(assetsDir.fsName + "/" + src.name);
              if (tgt.exists) {
                var dot = src.name.lastIndexOf(".");
                var base = dot > 0 ? src.name.substr(0, dot) : src.name;
                var ext = dot > 0 ? src.name.substr(dot) : "";
                var k = 2;
                do {
                  tgt = new File(
                    assetsDir.fsName + "/" + base + "_" + k + ext
                  );
                  k++;
                } while (tgt.exists);
              }
              if (!src.copy(tgt)) {
                try {
                  removeDirRecursive(destDir);
                } catch (_) {
                }
                _reopenOriginal(originalFile, backupFile);
                alert("Failed to copy asset: " + src.fsName);
                return JSON.stringify({
                  ok: false,
                  error: "assets-copy"
                });
              }
              it.replace(tgt);
              createdAssets.push(tgt);
            }
          } catch (e) {
            try {
              removeDirRecursive(destDir);
            } catch (_) {
            }
            _reopenOriginal(originalFile, backupFile);
            alert("Failed to copy asset " + (e && e.message || e));
            return JSON.stringify({
              ok: false,
              error: "assets:" + (e && e.message || e)
            });
          }
        }
      }
      if (undoOpen) {
        app.endUndoGroup();
        undoOpen = false;
      }
      var OM_PNG_NAME = "EZIMPORT_PNG";
      var OM_MOV_NAME = "EZIMPORT_MOV";
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
      var tsPng = omPng.templates, hasPng = false;
      for (var i = 0; i < tsPng.length; i++) {
        if (String(tsPng[i]) === OM_PNG_NAME) {
          hasPng = true;
          break;
        }
      }
      if (!hasPng) {
        try {
          removeDirRecursive(destDir);
        } catch (_) {
        }
        _reopenOriginal(originalFile, backupFile);
        alert(
          "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D Output Module \u0448\u0430\u0431\u043B\u043E\u043D '" + OM_PNG_NAME + "'. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 .aom \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435."
        );
        return JSON.stringify({ ok: false, error: "png-om-missing" });
      }
      omPng.applyTemplate(OM_PNG_NAME);
      omPng.file = new File(destDir.fsName + "/preview_[#####].png");
      qiPng.render = true;
      var qiMov = null, movFile = null;
      if (wantMov) {
        qiMov = rq.items.add(comp);
        qiMov.setSettings({ Quality: "Best", Resolution: "Full" });
        var omMov = qiMov.outputModule(1);
        var tsMov = omMov.templates, hasMov = false;
        for (var j = 0; j < tsMov.length; j++) {
          if (String(tsMov[j]) === OM_MOV_NAME) {
            hasMov = true;
            break;
          }
        }
        if (!hasMov) {
          try {
            removeDirRecursive(destDir);
          } catch (_) {
          }
          _reopenOriginal(originalFile, backupFile);
          alert(
            "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D Output Module \u0448\u0430\u0431\u043B\u043E\u043D '" + OM_MOV_NAME + "'. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 .aom \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435."
          );
          return JSON.stringify({ ok: false, error: "mov-om-missing" });
        }
        omMov.applyTemplate(OM_MOV_NAME);
        movFile = new File(destDir.fsName + "/" + title + ".mov");
        omMov.file = movFile;
        qiMov.render = true;
      }
      var okRQ = rq.render();
      try {
        qiPng.remove && qiPng.remove();
      } catch (_) {
      }
      try {
        qiMov && qiMov.remove && qiMov.remove();
      } catch (_) {
      }
      var seqList = destDir.getFiles(function(f) {
        return f instanceof File && /^preview_\d+\.png$/i.test(f.name);
      });
      if (!seqList || seqList.length !== 1) {
        try {
          removeDirRecursive(destDir);
        } catch (_) {
        }
        _reopenOriginal(originalFile, backupFile);
        alert("PNG not found after render");
        return JSON.stringify({ ok: false, error: "png-missing" });
      }
      var pngFinal = new File(destDir.fsName + "/preview.png");
      if (pngFinal.exists) {
        try {
          pngFinal.remove();
        } catch (_) {
        }
      }
      seqList[0].copy(pngFinal.fsName);
      try {
        seqList[0].remove();
      } catch (_) {
      }
      var aepFinal = new File(destDir.fsName + "/" + title + ".aep");
      proj.save(aepFinal);
      var okCommit = _commitTmp(tmpOutputs);
      if (okCommit !== "ok") {
        try {
          removeDirRecursive(destDir);
        } catch (_) {
        }
        _reopenOriginal(originalFile, backupFile);
        alert("Failed to finalize output files: " + okCommit);
        return JSON.stringify({ ok: false, error: okCommit });
      }
      _reopenOriginal(originalFile, backupFile);
      try {
        if (backupFile && backupFile.exists) backupFile.remove();
      } catch (_) {
      }
      return JSON.stringify({
        ok: true,
        aepPath: aepFinal.fsName.replace(/__tmp\.aep$/, ".aep"),
        pngPath: pngFinal.fsName.replace(/__tmp\.png$/, ".png"),
        movPath: movFile ? movFile.fsName.replace(/__tmp\.mov$/, ".mov") : null
      });
    } catch (e) {
      try {
        removeDirRecursive(destDir);
      } catch (_) {
      }
      if (undoOpen) {
        try {
          app.endUndoGroup();
        } catch (_) {
        }
        undoOpen = false;
      }
      try {
        _reopenOriginal(originalFile, backupFile);
      } catch (_) {
      }
      alert("Error: " + (e && e.message || e));
      return JSON.stringify({
        ok: false,
        error: String(e && e.message || e)
      });
    } finally {
      if (undoOpen) {
        try {
          app.endUndoGroup();
        } catch (_) {
        }
      }
    }
  }

  // src/host/AEFT/src/index.js
  var AEFT = {
    AE_ImportFile: AE_ImportFile,
    AE_GetActiveCompName: AE_GetActiveCompName,
    AE_HasActiveComp: AE_HasActiveComp,
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
