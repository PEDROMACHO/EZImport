import Vue from "vue";

export default {
	namespaced: true,
	state: () => ({
		loaders: {}, // ключи активных загрузчиков
	}),
	getters: {
		// глобальный индикатор: true, если есть хоть один активный загрузчик
		isLoading: (state) => Object.keys(state.loaders).length > 0,

		// локальный индикатор по ключу
		isLoadingByKey: (state) => (key) => !!state.loaders[key],

		// проверка по списку ключей
		isLoadingByKeys: (state) => (keys) =>
			keys.some((k) => !!state.loaders[k]),
	},
	mutations: {
		START(state, key) {
			Vue.set(state.loaders, key, true);
		},
		STOP(state, key) {
			Vue.delete(state.loaders, key);
		},
		RESET(state) {
			state.loaders = {};
		},
	},
	actions: {
		start({ commit }, key) {
			commit("START", key);
		},
		stop({ commit }, key) {
			commit("STOP", key);
		},
		reset({ commit }) {
			commit("RESET");
		},
	},
};
