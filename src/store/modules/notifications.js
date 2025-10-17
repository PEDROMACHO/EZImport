export default {
	namespaced: true,

	state: () => ({
		items: [], // [{ type: "error"|"warn"|"info", text, time }]
	}),

	mutations: {
		add(state, { type, text }) {
			state.items.push({ type, text, time: Date.now() });
		},
		clear(state) {
			state.items = [];
		},
		remove(state, index) {
			state.items.splice(index, 1);
		},
	},

	actions: {
		error({ commit }, text) {
			commit("add", { type: "error", text });
		},
		warn({ commit }, text) {
			commit("add", { type: "warn", text });
		},
		info({ commit }, text) {
			commit("add", { type: "info", text });
		},
		clear({ commit }) {
			commit("clear");
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
