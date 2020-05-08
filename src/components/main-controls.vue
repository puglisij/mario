<template>
    <form 
        class="main-controls my2"
        @keydown.enter.prevent
        @submit.prevent
    >
        <div class="main-controls__controls">
            <button class="topcoat-button--large" 
                @click="onPipelineRun"
                title="Run all pipelines with the defined source."
                type="submit"
                v-show="canRun">&#9654;</button>
            <button class="topcoat-button--large" 
                @click="onPipelineResume"
                title="Resume processing."
                v-show="canResume">Resume</button>
            <button class="topcoat-button--large" 
                @click="onPipelinePause"
                title="Pause processing."
                v-show="canPause">&#10074;&#10074;</button>
            <button class="topcoat-button--large" 
                @click="onPipelineStop"
                title="Stop all pipelines and file watchers."
                v-show="canStop" 
                >&#9724;</button>
        </div>
        <transition>
            <div class="main-controls__drawer" 
                v-show="isMainDrawerOpen"
            >
                <!-- <div v-if="isInitializing">Initializing<wait-dots/></div> -->
                <select class="topcoat-text-input" v-model="imageSourceType"> 
                    <option v-for="option in imageSourceTypeOptions" :value="option.value" :key="option.value">
                        {{ option.text }} 
                    </option>
                </select>
                <validation-provider 
                    slim
                    rules="pathexists" 
                    v-slot="{ errors }"
                    v-if="isSourceADirectory"
                >
                    <a-folder-input
                        title="The source folder containing files for processing."
                        :errors="errors"
                        v-model="imageSourcePath"
                    >
                        Source files from this folder
                    </a-folder-input>
                </validation-provider>
                <validation-provider 
                    slim
                    rules="required" 
                    v-slot="{ errors }"
                    v-if="isSourceADirectory"
                >
                    <label>
                        <div class="label">Only these Extensions</div>
                        <div class="flex">
                            <a-array-input class="topcoat-text-input full-width" 
                                placeholder="jpg, jpeg, png, psd, tif, etc." 
                                title="Either multiple image extensions, or json (exclusive). A comma delimited list."
                                :value="imageSourceExtensions"
                                @change="onExtensions"
                            />
                            <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
                        </div>
                    </label>
                </validation-provider>
            </div>
        </transition>
        <div class="main-controls__drawer-toggle" :class="{ active: isMainDrawerOpen }">
            <button class="topcoat-button" 
                @click="isMainDrawerOpen = !isMainDrawerOpen"
            >Status &amp; Source <span>❱</span></button>
        </div>
    </form>
</template>

<script>
import _ from "../utils";
import store from "../store"; 
import eventBus from "../eventBus";
import Server from '../server';
import PipelineEngineState from '../server/pipelineEngineState';
import ImageSourceType from '../server/imageSourceType';
import WaitDots from './wait-dots.vue';

export default {
    name: 'MainControls',
    components: {
        WaitDots
    },
    data() {
        const imageSource = _.simpleDeepClone(store.general.imageSource);
        return {
            pipelineEngineState: Server.pipelineEngine.state,
            isMainDrawerOpen: store.general.isMainDrawerOpen,
            imageSourceType: imageSource.type,
            imageSourcePath: imageSource.directory,
            imageSourceExtensions: imageSource.extensions,
            imageSourceTypeOptions: [
                { text: "Open Files", value: ImageSourceType.OPENFILES }, 
                { text: "Directory", value: ImageSourceType.DIRECTORY }, 
                { text: "File Watchers", value: ImageSourceType.FILEWATCHER }, 
                { text: "None", value: ImageSourceType.BLANK }
            ]
        }
    },
    watch: {
        isMainDrawerOpen: v => { store.general.isMainDrawerOpen = v; }
    },
    computed: {
        canPause() {
            return this.pipelineEngineState == PipelineEngineState.IDLE 
                || this.pipelineEngineState == PipelineEngineState.PROCESSING;
        },
        canStop() {
            return !this.pipelineEngineState == PipelineEngineState.STOPPED;
        },
        canResume() {
            return this.pipelineEngineState == PipelineEngineState.PAUSED;
        },
        canRun() {
            return this.pipelineEngineState == PipelineEngineState.STOPPED;
        },
        isSourceADirectory() {
            return this.imageSourceType == ImageSourceType.DIRECTORY;
        }
    },
    created() 
    {
        eventBus.$on("pipeline-play", pipelineName => {
            // get sourceType, sourcePath, sourceExtensions
            //Server.pipelineEngine.run([pipelineName], )
            console.log("Main controls received Play for pipeline " + pipelineName);
        });
        Server.pipelineEngine.on("state", state => {
            this.pipelineEngineState = state;
        });
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
