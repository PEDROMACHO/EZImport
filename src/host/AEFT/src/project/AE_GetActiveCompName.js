function AE_GetActiveCompName() {
	try {
		var it = app.project && app.project.activeItem;
		return it && it instanceof CompItem ? it.name : "";
	} catch (e) {
		return "";
	}
}

export { AE_GetActiveCompName };