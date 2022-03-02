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


    window.vue = new Vue({
        render: h => h(App),
        beforeDestroy: destroy
    }).$mount('#app');

    await Server.init();
    await Host.init(); 
    await HostScriptListener.init();
    await Validation.init();
};

create();

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

