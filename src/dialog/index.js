import dialog from './dialog.vue';
import {events} from './events';

const DEFAULT_NAME = 'a-dialog';
const Plugin = {
    install (Vue, globalOptions = {}) 
    {
      let componentName = DEFAULT_NAME;
  
      Vue.prototype.$dialog = {
        open (options) {
            events.$emit('open', options)
            // TODO return Promise for onYes, onCancel to support await pattern
        },
  
        close (name) {
            events.$emit('close', name)
        }
      }
  
      Vue.component(componentName, dialog)
    }
  }
  
  export default Plugin