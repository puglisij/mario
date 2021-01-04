import process from 'process';
import Vue from 'vue';
import App from './app.vue';
import Dialog from './dialog';
import Host from './host';
import HostScriptListener from './host/hostScriptListener';
import Logger from './console';
import Server from './server';
import global from './global';
import Validation from './validation';
import Store from './store';

global.csInterface.setWindowTitle("Mario v" + global.appVersion);

// Fixes module resolution issues for dependencies within node_modules
process.chdir(global.appWorkingPath);
__dirname = global.appWorkingPath;


Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(Dialog);

const destroy = () => {
    Server.destroy();
    Host.destroy();
    HostScriptListener.destroy();
    Logger.destroy();
};

const create = async () => {
    await Store.init();
    await Logger.init();
    await Server.init();
    await Host.init(); 
    await HostScriptListener.init();
    await Validation.init();

    window.vue = new Vue({
        render: h => h(App),
        beforeDestroy: destroy
    }).$mount('#app');
};

create();

window.addEventListener("beforeunload", destroy);

/**  
    beforeCreate -
        About to be initialized. 
        Data is not yet reactive. 
        Useful when you need logic/API call that does NOT need assigned to data 
        (Because data assigned now, would be lost once the state was initialized).
    created - 
        Events and data observation setup. 
        Not yet in native DOM. 
        Read/write data here, not in mounting hooks. 
        Useful for making API call and storing the value.
        (Although, API calls doesnt suggest fetch() or ajax calls inside your view logic!)
    beforeMount - 
        Right before render happens. 
        Template compiled and virtual DOM update by vue.  
    mounted - 
        $el added and native DOM updated. 
        Do modify DOM for integration of non-Vue libraries here.
        No guarantee that child components are mounted yet (Use $nextTick() if you need to)
    beforeUpdate - 
        Data has changed and update cycle starting. 
        Do get data before actually is rendered. 
    updated - 
        Data changed and native DOM updated. 
        Do access DOM after property changes here. 
    beforeDestroy - 
        About to teardown. 
        Still fully present and functional. 
        Do cleanup events, and subscriptions 
    destroyed - 
        Nothing left on your component. 
        Do last minute cleanups, etc. 
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