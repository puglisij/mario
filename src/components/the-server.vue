<template>
  <div>
        <h1 v-bind:style="{ color: statusColor }">Mario</h1>

        <section class="main-content">
            <div class="activity" v-bind:style="{ color: statusColor }" v-if="isPipelineActive">
                <span><strong>Pipeline:</strong> {{ currentPipeline }}</span><br/>
                <span><strong>Action:</strong> {{ currentPipelineAction }}</span>
            </div>
       </section>
        
  </div>
</template>

<script>
/* local modules */
import checkbox from "./checkbox.vue";
import startStop from "./start-stop.vue";
import Server from "../server";


export default {
    name: "TheServer",
    components: {
        checkbox,
        startStop,
        
    },
    data: () => ({
        server: null,
        isServerPaused: false, 
        isServerStopped: true,
        currentPipeline: "",
        currentPipelineAction: "",
        isPipelineActive: false
    }),
    computed: {
        statusColor() {
            if(this.isServerStopped) 
                return "#e52521";
            if(this.isServerPaused) 
                return "#fbd000";
            return "#43b047";
        }
    },
    created() 
    {
        this.server.on("init", this.onInitComplete);
        this.server.on("state", this.onStateChange);
        this.server.on("pipelinestart", this.onPipelineStart);
        this.server.on("action", this.onAction);
        this.server.on("pipelineend", this.onPipelineEnd);

        window.addEventListener("beforeunload", event => {
            this.destroy();
        });

        console.log("Server component created.");
    },
    beforeDestroy() 
    {
        this.destroy();
    },
    methods: 
    {
        destroy() 
        {
            // Cleanup server instance
            if(this.server) 
            {
                this.server.removeListener("init", this.onInitComplete);
                this.server.removeListener("state", this.onStateChange);
                this.server.removeListener("pipelinestart", this.onPipelineStart);
                this.server.removeListener("action", this.onAction);
                this.server.removeListener("pipelineend", this.onPipelineEnd);
                this.server.close();
            }
            console.log("Server component destroyed.");
        },
        start() 
        {
            this.server.start();
        },
        pause() 
        {
            this.server.pause();
        },
        stop() 
        {
            this.server && this.server.stop();
        }, 
        onInitComplete() {
            const configClone = this.server.getGeneralConfiguration();
            this.configuration = configClone;

            const pipelineConfigClone = this.server.getPipelineConfiguration();
            this.pipelineConfiguration = pipelineConfigClone;
            
            this.areConfigurationsLoaded = true;
            this.$emit("loaded");
        },
        onStateChange() {
            this.isServerPaused = this.server.isPaused();
            this.isServerStopped = this.server.isStopped();
        },
        onPipelineStart(pipelineName) {
            this.isPipelineActive = true;
            this.currentPipeline = pipelineName;
        },
        onAction(actionName) {
            this.currentPipelineAction = actionName;
        },
        onPipelineEnd() {
            this.currentPipeline = "";
            this.currentPipelineAction = "";
            this.isPipelineActive = false;
        },
        onPipelineRunWithDefaults(pipeline) {
            const defaults = pipeline.defaults;
            this.server.processImageWithJson(defaults);
        }
    }
};
</script>
