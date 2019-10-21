import Vue from 'vue';
import Notifications from 'vue-notification';
import { store } from './store';
import App from './App.vue';


Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.use(Notifications);


new Vue({
    store,
    render: h => h(App)
}).$mount('#app');

