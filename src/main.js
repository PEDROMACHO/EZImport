import Vue from 'vue';
import store from './store'; // Импорт вашего Vuex store
import App from './App.vue';
import router from './router';
import './assets/index.css';

Vue.config.productionTip = false;
Vue.config.devtools = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');
