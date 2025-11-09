import convict from "convict";

const config = convict({
	libraries: {
		doc: "Список библиотек",
		format: Array,
		default: [],
	},
	settings: {
		locale: {
			doc: "Локаль интерфейса",
			format: ["en", "ru"],
			default: "ru",
		},
		system: {
			doc: "Дизайн интерфейса",
			format: ["spectrum", "spectrum-two", "express"],
			default: "spectrum-two",
		},
		themeMode: "ae", // manual | ae
		theme: {
			doc: "Тема интерфейса",
			format: ["light", "dark", "darkest"],
			default: "dark",
		},
		scale: {
			doc: "Масштаб",
			format: ['medium', 'large'],
			default: 'medium',
		},
		direction: {
			doc: "Направление",
			format: ['ltr', 'rtl'],
			default: 'ltr',
		}
	},
}, { args: false, env: false });

export default config;
