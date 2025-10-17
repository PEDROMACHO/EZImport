export function getCSS(prop) {
	return window
		.getComputedStyle(document.documentElement)
		.getPropertyValue(`${/^\-\-/.test(prop) ? prop : "--" + prop}`);
}

export function setCSS(prop, data) {
	document.documentElement.style.setProperty(
		`${/^\-\-/.test(prop) ? prop : "--" + prop}`,
		data
	);
}
