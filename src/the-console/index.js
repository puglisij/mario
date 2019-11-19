import theConsole from './the-console.vue';
import logger from './logger';
import global from '../global';

const Plugin = {
    install (Vue, options = {}) 
    {
        logger.init({
            logDirectory: global.hostPath, 
            logFileEnabled: true
        });
        window.addEventListener("beforeunload", event => {
            logger.close();
        });

        Vue.component("the-console", theConsole)
    }
  }
  
  export default Plugin