import ADialogRoot from './a-dialog-root.vue';
import {events} from './events';

const Plugin = {
    install (Vue, globalOptions = {}) 
    {
        Vue.prototype.$dialog = {
            /**
             * Opens a simple message confirmation dialog
             * @param {string} message message to display
             * @param {function} onYes callback for Yes answer
             * @param {function} onCancel callback for Cancel answer
             */
            openConfirm(options) {
                events.$emit('openconfirm', options);
            },
            open (options) {
                events.$emit('open', options);
            }
        };

        Vue.component('ADialogRoot', ADialogRoot)
    }
}
  
export default Plugin