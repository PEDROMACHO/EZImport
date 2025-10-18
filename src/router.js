import Vue from "vue";
import Router from "vue-router";

import store from "@/store";

import LibraryPage from "@/components/pages/LibraryPage.vue";
import SettingsPage from "@/components/pages/SettingsPage.vue";

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: "/",
			name: "Library",
			component: LibraryPage,
		},
		{
			path: "/settings",
			name: "Settings",
			component: SettingsPage,
		},
	],
});

// глобальный guard
router.beforeEach(async (to, from, next) => {
	// Инициализируем конфиг (загрузим config.json)
	if (!store.state.config.pathDirectory) {
		await store.dispatch("config/initConfig");
	}

	// Если папка всё ещё не выбрана → уводим на настройки
	if (!store.state.config.pathDirectory && to.name !== "Settings") {
		return next({ name: "Settings", query: { first: 1 } });
	}

	// Если папка выбрана, но идём в Settings как старт → в Home
	if (
		store.state.config.pathDirectory &&
		to.name === "Settings" &&
		from.name == null
	) {
		return next({ name: "Home" });
	}

	next();
});

export default router;
