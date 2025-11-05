// store/modules/cache.js
export default {
	namespaced: true,

	state: () => ({
		blobs: {}, // { path: { url, refs } }
	}),

	mutations: {
		SET_BLOB(state, { path, url }) {
			if (!state.blobs[path]) {
				state.blobs[path] = { url, refs: 1 };
			} else {
				state.blobs[path].refs++;
			}
		},
		RELEASE_BLOB(state, path) {
			const entry = state.blobs[path];
			if (!entry) return;
			entry.refs--;
			if (entry.refs <= 0) {
				delete state.blobs[path];
			}
		},
		CLEAR(state) {
			for (const path in state.blobs) {
				URL.revokeObjectURL(state.blobs[path].url);
			}
			state.blobs = {};
		},
	},

	getters: {
		getBlob: (s) => (path) => s.blobs[path]?.url || null,
	},

	actions: {
		async ensureBlob({ commit, getters }, { path, toBlobUrl }) {
			const cached = getters.getBlob(path);
			if (cached) {
				commit("SET_BLOB", { path, url: cached });
				return cached;
			}
			const url = await toBlobUrl(path);
			commit("SET_BLOB", { path, url });
			return url;
		},
		releaseBlob({ commit }, path) {
			commit("RELEASE_BLOB", path);
		},
		clear({ commit }) {
			commit("CLEAR");
		},
	},
};
