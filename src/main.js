import Vue from 'vue';
import App from './app.vue';
import Dialog from './dialog';
import TheConsole from './the-console';

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(Dialog);
Vue.use(TheConsole);


window.vue = new Vue({
    render: h => h(App)
}).$mount('#app');

