import Vue from 'vue';
import App from './app.vue';
import Dialog from './dialog';
import Host from './host';
import HostScriptListener from './host/hostScriptListener';
import Logger from './console';
import Server from './server';
import Validation from './validation';


const create = () => {
    Logger.init();
    Server.init();
    Host.init();
    HostScriptListener.init();
};
const destroy = () => {
    Server.destroy();
    Host.destroy();
    HostScriptListener.destroy();
    Logger.destroy();
};

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(Dialog);


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


// Vue.directive("print", {
//     bind: function(el, binding, vnode) {
//         var s = JSON.stringify
//         el.innerHTML =
//         'name: '       + s(binding.name) + '<br>' +
//         'value: '      + s(binding.value) + '<br>' +
//         'expression: ' + s(binding.expression) + '<br>' +
//         'argument: '   + s(binding.arg) + '<br>' +
//         'modifiers: '  + s(binding.modifiers) + '<br>' +
//         'vnode keys: ' + Object.keys(vnode).join(', ')
//     }
// });