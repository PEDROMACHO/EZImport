// store/modules/search.js
import Fuse from "fuse.js";

export default {
	namespaced: true,

	state: () => ({
		query: "",
		results: [],
		fuse: null,
	}),

	mutations: {
		SET_QUERY(state, q) {
			state.query = q;
		},
		SET_RESULTS(state, r) {
			state.results = r;
		},
		SET_FUSE(state, { fuse }) {
			state.fuse = fuse;
		},
	},

	actions: {
		init({ commit, rootGetters, rootState }) {
			const activeIndex = rootState.library.activeIndex;
			const libPath = rootGetters["config/getLibraryPath"](activeIndex);

			if (!libPath) {
				commit("SET_FUSE", { fuse: null, libPath: null });
				commit("SET_RESULTS", []);
				return;
			}

			const itemsByCategory =
				rootGetters["manifest/itemsByCategory"](libPath) || {};
			const allItems = [];

			for (const [catPath, items] of Object.entries(itemsByCategory)) {
				for (const item of items) {
					allItems.push({ ...item, categoryPath: catPath });
				}
			}

			const fuse = new Fuse(allItems, {
				keys: ["name", "formats"],
				threshold: 0.3,
				includeScore: true,
				includeMatches: true,
			});

			commit("SET_FUSE", { fuse, libPath });

			const q = rootGetters["search/query"];
			if (q) {
				const results = fuse
					.search(q)
					.map((r) => ({ ...r.item, matches: r.matches }));
				commit("SET_RESULTS", results);
			} else {
				commit("SET_RESULTS", []);
			}
		},

		run({ commit, state }, query) {
			commit("SET_QUERY", query);

			if (!query || !state.fuse) {
				commit("SET_RESULTS", []);
				return;
			}

			const results = state.fuse
				.search(query)
				.map((r) => ({ ...r.item, matches: r.matches }));

			commit("SET_RESULTS", results);
		},
	},

	getters: {
		query: (s) => s.query,
		results: (s) => s.results,
	},
};
