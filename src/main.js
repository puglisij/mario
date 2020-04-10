import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import App from './app.vue';
import Dialog from './dialog';
import TheConsole from './the-console';
import Host from './host';
import Server from './server';


const create = () => {
    Host.init();
    Server.init();
};
const destroy = () => {
    Host.close();
    Server.close();
};

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(Dialog);
Vue.use(TheConsole);
Vue.use(Vuelidate);

window.vue = new Vue({
    render: h => h(App),
    beforeCreate: create,
    beforeDestroy: destroy
}).$mount('#app');

window.addEventListener("beforeunload", destroy);

/**  
    beforeCreate - about to be initialized. data is not yet reactive 
    created - events and data observation setup. not yet in native DOM. access data here, not in mounting hooks 
    beforeMount - right before render happens. template compiled and virtual DOM update by vue.  
    mounted - $el added and native DOM updated. do modify DOM for integration of non-Vue libraries here.
    beforeUpdate - data has changed and update cycle starting. do get data before actually is rendered. 
    updated - data changed and native DOM updated. do access DOM after property changes here. 
    beforeDestroy - about to teardown. still fully present and functional. do cleanup events, and subscriptions 
    destroyed - nothing left on your component. do last minute cleanups, etc. 
*/
