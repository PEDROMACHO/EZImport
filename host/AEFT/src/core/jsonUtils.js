function _opts(o) {
	if (o && typeof o === "object") return o;
	try {
		return JSON.parse(o);
	} catch (_) {
		return {};
	}
}

export { _opts };
