<template>
    <div class="main-controls my2">
        <div v-if="!isUninitialized">
            <button class="topcoat-button--large" 
                @click="onRunPause"
                :title="primaryButtonTitle"
                v-html="primaryButtonLabel"></button>
            <button class="topcoat-button--large" 
                @click="onStop"
                title="Stop all pipelines."
                v-show="!isStopped" 
                >&#9724;</button>
        </div>
        <div v-if="isUninitialized">Initializing<wait-dots/></div>
    </div>
</template>

<script>
import Server from '../server';
import { ServerState } from '../server/enum';
import WaitDots from "./wait-dots.vue";

// TODO: Control panel for file watchers / pipelines
export default {
    name: 'MainControls',
    components: {
        WaitDots
    },
    data() {
        return {
            serverState: Server.getState()
        }
    },
    beforeCreate() 
    {
        Server.on("state", state => {
            this.serverState = state;
        })
    },
    computed: {
        isUninitialized() {
            return this.serverState == ServerState.UNINITIALIZED;
        },
        isRunning() {
            return this.serverState == ServerState.RUNNING;
        },
        isPaused() {
            return this.serverState == ServerState.PAUSED;
        },
        isStopped() {
            return this.serverState == ServerState.STOPPED;
        },
        primaryButtonLabel() {
            if(this.isPaused) {
                return "Resume";
            } 
            if(this.isStopped) {
                return "&#9654;";
            }
            return "&#10074;&#10074;";
        },
        primaryButtonTitle() {
            if(this.isPaused) {
                return "Resume all pipelines.";
            }
            if(this.isStopped) {
                return "Run all pipelines.";
            }
            return "Pause all pipelines.";
        }
    },
    methods: {
        onRunPause() {
            Server.run();
        },
        onStop() {
            Server.stop();
        }
    }
}
</script>
