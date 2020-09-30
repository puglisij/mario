<template>
    <validation-observer 
        ref="observer"
        slim
        v-slot="{ handleSubmit }"
    >
        <form 
            class="main-controls my2"
            @keydown.enter.prevent
            @submit.prevent="handleSubmit(onPipelineRun)"
        >
            <div class="main-controls__controls mb2">
                <button class="topcoat-button--large" 
                    type="submit"
                    title="Run all pipelines on the selected source."
                    v-show="isStopped">&#9654;</button>
                <button class="topcoat-button--large" 
                    type="button"
                    @click="onPipelineResume"
                    title="Resume processing."
                    v-show="isPaused">Resume</button>
                <button class="topcoat-button--large" 
                    type="button"
                    @click="onPipelinePause"
                    title="Pause processing."
                    v-show="canPause">&#10074;&#10074;</button>
                <button class="topcoat-button--large" 
                    type="button"
                    @click="onPipelineStop"
                    title="Stop all pipelines and file sources."
                    v-show="!isStopped" 
                    >&#9724;</button>
            </div>
            <div class="main-controls__drawer columns" 
                v-show="isMainDrawerOpen"
            >
                <div class="column is-half-tablet">
                    <h3 class="section-title">Pipelines Status</h3>
                    <div>{{ pipelineEngineStateText }}</div>
                    <h3 class="section-title" v-show="pipelineActionStateText">Action</h3>
                    <div>{{ pipelineActionStateText }}</div>
                    <!-- <div v-if="isInitializing">Initializing<wait-dots/></div> -->
                </div>
                <div class="column is-half-tablet">
                    <h3 class="section-title" v-if="pipelinefilePathText">Current Source Path</h3>
                    <div>{{ pipelinefilePathText }}</div>
                </div>
            </div>
            <div class="main-controls__drawer-toggle" :class="{ active: isMainDrawerOpen }">
                <button 
                    class="topcoat-button--large" 
                    type="button"
                    @click="isMainDrawerOpen = !isMainDrawerOpen"
                >Source &amp; Status <span>❱</span></button>
            </div>
        </form>
    </validation-observer>
</template>

<script>
import { ValidationProvider, ValidationObserver } from "vee-validate";

import _ from "../utils";
import store from "../store"; 
import eventBus from "../eventBus";
import Server from '../server';
import PipelineEngineState from '../server/pipelineEngineState';
import WaitDots from './wait-dots.vue';

export default {
    name: 'MainControls',
    components: {
        ValidationObserver,
        ValidationProvider,
        WaitDots
    },
    data() {
        return {
            pipelineEngineState: Server.pipelineEngine.state,
            pipelineActionStateText: "",
            pipelinefilePathText: "",
            isMainDrawerOpen: store.general.isMainDrawerOpen
        }
    },
    watch: {
        isMainDrawerOpen: v => { store.general.isMainDrawerOpen = v; }
        // imageSource: {
        //     deep: true, 
        //     handler: function(v) {
        //         store.general.imageSource = v;
        //     }
        // }
    },
    computed: {
        canPause() {
            return this.pipelineEngineState == PipelineEngineState.IDLE 
                || this.pipelineEngineState == PipelineEngineState.PROCESSING;
        },
        isStopped() {
            return this.pipelineEngineState == PipelineEngineState.STOPPED;
        },
        isPaused() {
            return this.pipelineEngineState == PipelineEngineState.PAUSED;
        },
        isProcessing() {
            return this.pipelineEngineState == PipelineEngineState.PROCESSING;
        },
        pipelineEngineStateText() {
            return PipelineEngineState.toKey(this.pipelineEngineState);
        }
    },
    created() 
    {
        eventBus.$on("pipeline-play", pipelineName => {
            Server.pipelineEngine.run(pipelineName);
        });
        Server.pipelineEngine.on("state", state => {
            this.pipelineEngineState = state;
        });
        Server.pipelineEngine.on("action", actionName => {
            this.pipelineActionStateText = actionName;
        });
        Server.pipelineEngine.on("actionend", actionName => {
            this.pipelineActionStateText = "";
        });
        Server.pipelineEngine.on("processimage", filePath => {
            this.pipelinefilePathText = filePath;
        });
        Server.pipelineEngine.on("processend", () => {
            this.pipelineActionStateText = "";
            this.pipelinefilePathText = "";
        })
    },
    methods: {
        /**
         * Submit handler
         */
        onPipelineRun() {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "This will run all pipelines with their configured sources. Continue?",
                onYes: () => {
                    Server.pipelineEngine.runAll();
                }
            });
        },
        onPipelineResume() {
            Server.pipelineEngine.resume();
        },
        onPipelinePause() {
            Server.pipelineEngine.pause();
        },
        onPipelineStop() {
            Server.pipelineEngine.stop();
        }
    }
}
</script>
