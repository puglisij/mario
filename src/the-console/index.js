import theConsole from './the-console.vue';
import logger from './logger';
import global from '../global';
import store from '../store';

const Plugin = {
    install (Vue, options = {}) 
    {
        logger.init({
            logDirectory: store.general.logDirectory || global.appDefaultLogPath, 
            logFileEnabled: true
        });
        window.addEventListener("beforeunload", event => {
            logger.close();
        });

        Vue.component("the-console", theConsole)
    }
  }
  
  export default Plugin