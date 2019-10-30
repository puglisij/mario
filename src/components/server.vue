<template>
  <div>
      <h2>Server</h2>
      <!-- TODO: rename as server-controls and move options -->
      <server-start-stop 
        v-bind:isPaused="isServerPaused" 
        v-bind:isStopped="isServerStopped"
        v-on:start="start" 
        v-on:pause="pause" 
        v-on:stop="stop"></server-start-stop>
        <notifications group="foo" 
                       position="bottom left"
                       :max="1" /> 

        <section id="server-options">
            
            <label class="topcoat-checkbox">
                <input type="checkbox" name="pauseAfterEveryAction" v-on:change="onConfigurationCheckbox">
                <div class="topcoat-checkbox__checkmark"></div>
                Pause after every action
            </label>
            <label class="topcoat-checkbox">
                <input type="checkbox" name="pauseAfterEveryImage" v-on:change="onConfigurationCheckbox">
                <div class="topcoat-checkbox__checkmark"></div>
                Pause after each image
            </label>
            <checkbox name="pauseOnExceptions">
                Pause on Exceptions
            </checkbox>
        </section>

        <!-- Add server-configurator component here -->
  </div>
</template>

<script>
/* npm modules */
import { mapState, mapGetters } from 'vuex';

/* local modules */
import serverStartStop from "./server-start-stop.vue";
import Server from "../server";

let serverConfiguration = {};

export default {
    name: "server",
    components: {
        serverStartStop
    },
    data: () => ({
        server: null,
        isServerPaused: false, 
        isServerStopped: true
    }),
    computed: {
        ...mapState(['cs', 'hostPath', 'hostActionPath'])
    },
    created() 
    {
        this.server = new Server(this.hostPath, this.hostActionPath);
        this.server.init();
        this.server.on("state", this.onStateChange);

        window.addEventListener("beforeunload", event => {
            this.stop();
        });
        console.log("Server component created.");
    },
    mounted() 
    {
        // Update basic settings ui

    },
    beforeDestroy() 
    {
        // Cleanup server instance
        this.stop();
        console.log("Server component destroyed.");
    },
    methods: 
    {
        start() 
        {
            console.log("Server start received");
            this.server.start();
            //const forked = fork('server.js');
            //forked.kill();
            
            this.$notify({
                group: "foo",
                title: "Look!",
                text: "We're Started."
            })
        },
        pause() 
        {
            console.log("Server pause received");
            this.server.pause();
        },
        stop() 
        {
            console.log("Server stop received");
            this.server && this.server.close();
        }, 
        onStateChange() {
            this.isServerPaused = this.server.isPaused();
            this.isServerStopped = this.server.isStopped();
        },
        onConfigurationCheckbox(event)
        {
            this.server.setConfiguration(event.target.name, event.target.checked);
        }
    }
};
</script>

<style scoped>
    label {
        display: block;
        margin: 10px 0;
    }
</style>