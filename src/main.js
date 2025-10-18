import Vue from "vue";
import store from "./store"; // Импорт вашего Vuex store
import App from "./App.vue";
import router from "./router";
import VueI18n from "vue-i18n";

import "./assets/index.css";

import ru from "@/locales/ru.json";
import en from "@/locales/en.json";

import "@spectrum-web-components/bundle/elements.js";

import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/theme/src/themes-core-tokens.js";

import "@spectrum-web-components/theme/src/spectrum-two/themes.js";
import "@spectrum-web-components/theme/src/spectrum-two/themes-core-tokens.js";

import "@spectrum-web-components/theme/src/express/themes.js";
import "@spectrum-web-components/theme/src/express/themes-core-tokens.js";

Vue.config.productionTip = false;
Vue.config.devtools = false;

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
