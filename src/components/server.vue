<template>
  <div>
        <h1 v-bind:style="{ color: statusColor }">Mario</h1>
        <section class="content">
            <h2>Server</h2>

            <start-stop 
                v-bind:isPaused="isServerPaused" 
                v-bind:isStopped="isServerStopped"
                v-on:start="start" 
                v-on:pause="pause" 
                v-on:stop="stop"></start-stop>
        
            <checkbox name="pauseAfterEveryPipeline" v-model="configuration.pauseAfterEveryPipeline" v-on:change="onConfigurationCheckbox">
                Pause after every pipeline
            </checkbox>
            <checkbox name="pauseAfterEveryAction" v-model="configuration.pauseAfterEveryAction" v-on:change="onConfigurationCheckbox">
                Pause after every action
            </checkbox>
            <checkbox name="pauseAfterEveryImage" v-model="configuration.pauseAfterEveryImage" v-on:change="onConfigurationCheckbox">
                Pause after each image
            </checkbox>
            <checkbox name="pauseOnExceptions" v-model="configuration.pauseOnExceptions" v-on:change="onConfigurationCheckbox">
                Pause on Exceptions
            </checkbox>

            <p class="current-action" v-if="isPipelineActive">
                Action: {{ currentPipelineAction }}
            </p>
        </section>
        
        <div class="topcoat-tab-bar tabs">
            <label class="topcoat-tab-bar__item "
                v-for="(tab, index) in tabs" 
                v-bind:key="tab"
                v-bind:ref="'tab-' + tab.toLowerCase()"
                v-on:click="currentTab = tab"
            >
                <input type="radio" v-bind:checked="currentTab == tab">
                <button class="topcoat-tab-bar__button">{{ tabNames[index] }}</button>
            </label>
        </div>
        <section class="content"> 
            <keep-alive>
                <the-console v-if="currentTabComponent == 'the-console'"></the-console>
            </keep-alive>
            <keep-alive> 
                <jsx v-if="currentTabComponent == 'jsx'"></jsx>
            </keep-alive>
            <configurator 
                v-if="currentTabComponent == 'configurator'" 
                v-bind:configuration="configuration"
                v-on:update:watchers="onWatchersConfiguration"
            ></configurator>
            <pipelines
                v-if="currentTabComponent == 'pipelines' && areConfigurationsLoaded"
                v-bind:configuration="pipelineConfiguration"
                v-on:changed="onPipelinesConfiguration"
            ></pipelines>
        </section>
  </div>
</template>

<script>
/* local modules */
import checkbox from "./checkbox.vue";
import startStop from "./start-stop.vue";
import jsx from "./jsx.vue";
import configurator from "./configurator.vue";
import pipelines from "./pipelines.vue";
import global from "../global";
import Server from "../server";


export default {
    name: "server",
    components: {
        checkbox,
        startStop,
        jsx,
        configurator,
        pipelines
    },
    data: () => ({
        tabs: ["jsx", "the-console", "configurator", "pipelines"],
        tabNames: ["Jsx", "Console", "Configuration", "Pipelines"],
        currentTab: "the-console",
        server: null,
        configuration: {},
        pipelineConfiguration: {},
        areConfigurationsLoaded: false,
        isServerPaused: false, 
        isServerStopped: true,
        currentPipelineAction: "",
        isPipelineActive: false
    }),
    computed: {
        currentTabComponent() {
            return this.currentTab.toLowerCase();
        },
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
        this.server = new Server(global.hostPath, global.hostActionPath);
        this.server.init();
        this.server.on("init", this.onInitComplete);
        this.server.on("state", this.onStateChange);
        this.server.on("pipelinestart", this.onPipelineStart);
        this.server.on("action", this.onAction);
        this.server.on("pipelineend", this.onPipelineEnd);

        window.addEventListener("beforeunload", event => {
            this.server && this.server.close();
        });
        console.log("Server component created.");
    },
    beforeDestroy() 
    {
        // Cleanup server instance
        this.server && this.server.close();
        console.log("Server component destroyed.");
    },
    methods: 
    {
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
            const configClone = this.server.getConfiguration();
            this.configuration = configClone;
            const pipelineConfigClone = this.server.getPipelineConfiguration();
            this.pipelineConfiguration = pipelineConfigClone;
            this.areConfigurationsLoaded = true;
        },
        onStateChange() {
            this.isServerPaused = this.server.isPaused();
            this.isServerStopped = this.server.isStopped();
        },
        onPipelineStart() {
            this.isPipelineActive = true;
        },
        onAction(action) {
            this.currentPipelineAction = action;
        },
        onPipelineEnd() {
            this.currentPipelineAction = "";
            this.isPipelineActive = false;
        },
        onConfigurationCheckbox(isChecked, name)
        {
            this.server.setConfiguration(name, isChecked);
        },
        onWatchersConfiguration(newWatchers)
        {
            this.configuration.watchers = newWatchers;
            this.server.setConfiguration("watchers", newWatchers);
            console.log("Watchers updated.");
        },
        onPipelinesConfiguration(newPipelines)
        {
            this.server.setPipelineConfiguration("pipelines", newPipelines);
            console.log("Pipelines updated.");
        }
    }
};
</script>

<style scoped lang="scss">
    .mario {
        animation: play 0.8s steps(4) infinite;

        background: url('https://raw.githubusercontent.com/LantareCode/random-this-and-thats/master/CSS/SuperMario-Animation/images/mariowalking/result.png') left center;    
        width: 71px;
        height: 72px;
    }
    @keyframes play{
        100%{background-position: -284px;}
    }

    .light {
        .tabs {
            background: #F4F4F4;
            border-top: 1px solid #9daca9;
        }
    }
    .dark {
        .tabs {
            background: #424242;
            border-top: 1px solid #383838;
        }
    }
    .tabs {
        font-size: .9em;
        width: 100%;
        label {
            display: inline-block;
        }
    }
    .content {
        padding: .5em;
    }
    .current-action {
        font-size: .8em;
    }
</style>