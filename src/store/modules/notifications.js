export default {
	namespaced: true,

	state: () => ({
		items: [], // [{ type: "error"|"warn"|"info", text, time }]
	}),

	mutations: {
		add(state, { type, text, silent = false }) {
			const entry = { type, text, time: Date.now() };

			// всегда логируем в консоль
			if (console[type]) {
				console[type](entry);
			} else {
				console.log(entry);
			}

			// только если не silent — добавляем в UI
			if (!silent) {
				state.items.push(entry);
			}
		},
		clear(state) {
			state.items = [];
		},
		remove(state, index) {
			state.items.splice(index, 1);
		},
	},

	actions: {
		error({ commit }, { text, silent = false }) {
			commit("add", { type: "error", text, silent });
		},
		warn({ commit }, { text, silent = false }) {
			commit("add", { type: "warn", text, silent });
		},
		info({ commit }, { text, silent = false }) {
			commit("add", { type: "info", text, silent });
		},
		clear({ commit }) {
			commit("clear");
		},
		logOnly({ commit }, { type, text }) {
			commit("add", { type, text, silent: true });
		},
	},

	getters: {
		all: (s) => s.items,
		last: (s) => s.items[s.items.length - 1] || null,
		infos: (s) => s.items.filter((i) => i.type === "info"),
		errors: (s) => s.items.filter((i) => i.type === "error"),
		warnings: (s) => s.items.filter((i) => i.type === "warn"),
	},
};
