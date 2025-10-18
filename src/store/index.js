import Vue from "vue";
import Vuex from "vuex";

import config from "./modules/config";
import library from "./modules/library";
import loading from "./modules/loading";
import categories from "./modules/categories";
import compositions from "./modules/compositions";
import notifications from "./modules/notifications";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		config,
		library,
		loading,
		categories,
		compositions,
		notifications,
	},
});
