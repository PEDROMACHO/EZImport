import Vue from "vue";
import Vuex from "vuex";

import config from "./modules/config";
import search from "./modules/search";
import library from "./modules/library";
import loading from "./modules/loading";
import manifest from "./modules/manifest";
import categories from "./modules/categories";
import compositions from "./modules/compositions";
import notifications from "./modules/notifications";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		search,
		config,
		library,
		loading,
		manifest,
		categories,
		compositions,
		notifications,
	},
});
