import dialog from './a-dialog.vue';
import {events} from './events';

const Plugin = {
    install (Vue, globalOptions = {}) 
    {
      Vue.prototype.$dialog = {
        open (options) {
            events.$emit('open', options)
            // TODO return Promise for onYes, onCancel to support await pattern
            // TODO Could instead use the Window() api to create dialogs on JSX side
        },
  
        close (name) {
            events.$emit('close', name)
        }
      }
  
      Vue.component('ADialog', dialog)
    }
  }
  
  export default Plugin