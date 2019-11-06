import Vue from 'vue';
import { store } from './store';
import App from './App.vue';
import Dialog from './dialog';


Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(Dialog);


window.vue = new Vue({
    store,
    render: h => h(App)
}).$mount('#app');

