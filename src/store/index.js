import Vue from "vue";
import Vuex from "vuex";

import config from "./modules/config";
import library from "./modules/library";
import categories from "./modules/categories";
import compositions from "./modules/compositions";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		config,
		library,
		categories,
		compositions,
	},
});
