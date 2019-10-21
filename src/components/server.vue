<template>
  <div>
      <h2>Server</h2>

      <server-start-stop 
        v-bind:isRunning="isServerRunning" 
        v-on:start="start" 
        v-on:pause="pause" 
        v-on:stop="stop"></server-start-stop>
        <notifications group="foo" 
                       position="bottom left"
                       :max="1" /> 
  </div>
</template>

<script>
/* npm modules */
import { mapState, mapGetters } from 'vuex';

/* local modules */
import serverStartStop from "./server-start-stop.vue";
import Server from "../server";


const ServerState = {
    STOPPED: 0, 
    PAUSED: 1,
    RUNNING: 2
};

export default {
    name: "server",
    components: {
        serverStartStop
    },
    data: () => ({
        server: null,
        serverState: ServerState.STOPPED
    }),
    computed: {
        ...mapState(['cs', 'hostPath']),
        isServerRunning() {
            return this.serverState == ServerState.RUNNING;
        }
    },
    /**  
     * about to be initialized. data is not yet reactive 
     */
    beforeCreate() {},
    /**  
     * events and data observation setup. not yet in native DOM. access data here, not in mounting hooks 
     */
    created() 
    {
        window.addEventListener("beforeunload", event => {
            this.stop();
        });
        console.log("Server component created.");
    },
    /**  
     * right before render happens. template compiled and virtual DOM update by vue.  
     */
    beforeMount() {},
    /**  
     * $el added and native DOM updated. do modify DOM for integration of non-Vue libraries here.
     */
    mounted() {},
    /**  
     * data has changed and update cycle starting. do get data before actually is rendered. 
     */
    beforeUpdate() {},
    /**  
     * data changed and native DOM updated. do access DOM after property changes here. 
     */
    updated() {},
    /**  
     * about to teardown. still fully present and functional. do cleanup events, and subscriptions 
     */
    beforeDestroy() 
    {
        this.stop();
        console.log("Server component destroyed.");
    },
    /**  
     * nothing left on your component. do last minute cleanups, etc. 
     */
    destroyed() {},
    methods: 
    {
        start() 
        {
            console.log("Server start received");
            //const forked = fork('server.js');
            //forked.kill();

            this.server = new Server(this.hostPath);
            this.server.init();
            
            this.$notify({
                group: "foo",
                title: "Look!",
                text: "We're Started."
            })
            this.serverState = ServerState.RUNNING;
        },
        pause() 
        {
            console.log("Server pause received");
            this.serverState = ServerState.PAUSED;
        },
        stop() 
        {
            console.log("Server stop received");
            this.server && this.server.close();
            this.serverState = ServerState.STOPPED;
        }
    }
};
</script>

<style>
/* No need for CSS in this component */
</style>