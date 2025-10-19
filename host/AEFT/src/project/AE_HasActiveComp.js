function AE_HasActiveComp() {
	try {
		if (!app.project) return "0";
		var it = app.project.activeItem;
		return it && it instanceof CompItem ? "1" : "0";
	} catch (e) {
		return "0";
	}
}

export { AE_HasActiveComp };