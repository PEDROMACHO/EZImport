export default {
	namespaced: true,
	state: () => ({
		loaders: new Set(), // активные загрузчики
	}),
	getters: {
		// глобальный индикатор: true, если есть хоть один активный загрузчик
		isLoading: (state) => state.loaders.size > 0,

		// локальный индикатор по ключу
		isLoadingByKey: (state) => (key) => state.loaders.has(key),

		// проверка по списку ключей
		isLoadingByKeys: (state) => (keys) => keys.some((k) => state.loaders.has(k)),

	},
	mutations: {
		START(state, key) {
			state.loaders.add(key);
		},
		STOP(state, key) {
			state.loaders.delete(key);
		},
		RESET(state) {
			state.loaders.clear();
		},
	},
	actions: {
		start({ commit }, key) {
			commit('START', key);
		},
		stop({ commit }, key) {
			commit('STOP', key);
		},
		reset({ commit }) {
			commit('RESET');
		},
	},
};
