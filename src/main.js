import Vue from "vue";
import store from "./store"; // Импорт вашего Vuex store
import App from "./App.vue";
import router from "./router";

import "./assets/index.css";

import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/theme/src/themes-core-tokens.js";

import "@spectrum-web-components/theme/src/spectrum-two/themes.js";
import "@spectrum-web-components/theme/src/spectrum-two/themes-core-tokens.js";

Vue.config.productionTip = false;
Vue.config.devtools = false;

import VueI18n from "vue-i18n";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";

Vue.use(VueI18n);

const i18n = new VueI18n({
	locale: "ru", // язык по умолчанию
	fallbackLocale: "en",
	messages: { ru, en },
});

new Vue({
	store,
	router,
	i18n,
	render: (h) => h(App),
}).$mount("#app");
