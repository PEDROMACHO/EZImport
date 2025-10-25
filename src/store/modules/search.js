// store/modules/search.js
import Fuse from "fuse.js";

export default {
	namespaced: true,

	state: () => ({
		query: "",
		results: [], // [{ name, path, categoryPath, previewPath }]
		fuse: null,
	}),

	mutations: {
		SET_QUERY(state, q) {
			state.query = q;
		},
		SET_RESULTS(state, r) {
			state.results = r;
		},
		SET_FUSE(state, f) {
			state.fuse = f;
		},
	},

	actions: {
		init({ commit, rootGetters }) {
			const itemsByCategory =
				rootGetters["manifest/itemsByCategory"] || {};
			const allItems = [];

			for (const [catPath, items] of Object.entries(itemsByCategory)) {
				for (const item of items) {
					allItems.push({
						...item,
						categoryPath: catPath,
					});
				}
			}

			const fuse = new Fuse(allItems, {
				keys: ["name", "formats"], // по каким полям искать
				threshold: 0.3, // чувствительность (0 = строго, 1 = всё подряд)
				includeScore: true,
				includeMatches: true,
			});

			commit("SET_FUSE", fuse);
		},

		run({ commit, state }, query) {
			commit("SET_QUERY", query);

			if (!query || !state.fuse) {
				commit("SET_RESULTS", []);
				return;
			}

			const results = state.fuse.search(query).map((r) => ({...r.item, matches: r.matches}));
			commit("SET_RESULTS", results);
		},
	},

	getters: {
		query: (s) => s.query,
		results: (s) => s.results,
	},
};
