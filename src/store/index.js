import Vue from 'vue';
import Vuex, { mapState } from 'vuex';
import fs from 'fs';
import upath from 'upath';

Vue.use(Vuex);


export const store = new Vuex.Store({
    state() {
        const cs = new CSInterface();
        const extensionPath = upath.normalize(cs.getSystemPath(SystemPath.EXTENSION));
        const hostPath = upath.join(extensionPath, process.env.VUE_APP_HOST_DIR);
        const hostActionPath = upath.join(hostPath, "actions");
        return {
            cs,
            extensionPath, 
            hostPath, 
            hostActionPath
        }
    },
    mutations: {},
    actions: {}
})