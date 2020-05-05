<template>
    <div class="main-controls my2">
        <div>
            <button class="topcoat-button--large" 
                @click="onPipelineRun"
                title="Activate pipeline file watchers to begin processing."
                v-show="isPipelineEngineIdle">&#9654;</button>
            <button class="topcoat-button--large" 
                @click="onPipelineResume"
                title="Resume processing."
                v-show="isPipelineEnginePaused">Resume</button>
            <button class="topcoat-button--large" 
                @click="onPipelinePause"
                title="Pause processing."
                v-show="!isPipelineEngineIdle">&#10074;&#10074;</button>
            <button class="topcoat-button--large" 
                @click="onPipelineStop"
                title="Stop all pipelines and file watchers."
                v-show="!isPipelineEngineIdle" 
                >&#9724;</button>
        </div>
        <!-- <div v-if="isInitializing">Initializing<wait-dots/></div> -->
    </div>
</template>

<script>
import Server from '../server';
import { PipelineEngineState } from '../server/pipelineEngine';
import WaitDots from './wait-dots.vue';

// TODO: Control panel for file watchers / pipelines
export default {
    name: 'MainControls',
    components: {
        WaitDots
    },
    data() {
        return {
            pipelineEngineState: Server.pipelineEngine.state
        }
    },
    created() 
    {
        Server.pipelineEngine.on("state", state => {
            this.pipelineEngineState = state;
        });
    },
    computed: {
        isPipelineEnginePaused() {
            return this.pipelineEngineState == PipelineEngineState.PAUSED;
        },
        isPipelineEngineIdle() {
            return this.pipelineEngineState == PipelineEngineState.IDLE;
        }
    },
    methods: {
        onPipelineRun() {
            Server.pipelineEngine.runAll();
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
