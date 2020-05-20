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
                    title="Run all pipelines with the defined source."
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
                    title="Stop all pipelines and file watchers."
                    v-show="!isStopped" 
                    >&#9724;</button>
            </div>
            <div class="main-controls__drawer columns" 
                v-show="isMainDrawerOpen"
            >
                <div class="column is-half-tablet">
                    <h3 class="section-title">File Source</h3>
                    <validation-provider
                        class="flex"
                        tag="label"
                        rules="required"
                        v-slot="{ errors }"
                    >
                        <select class="topcoat-text-input flex-grow" v-model="imageSource.type"> 
                            <option v-for="option in imageSourceTypeOptions" :value="option.value" :key="option.value">
                                {{ option.text }} 
                            </option>
                        </select>
                        <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
                    </validation-provider>
                    <validation-provider 
                        slim
                        :rules="{ required: isSourceADirectory, pathunc: { allowed: false }, pathexists: true }" 
                        v-slot="{ errors }"
                        v-if="isSourceADirectory"
                    >
                        <a-folder-input
                            title="The source folder containing files for processing."
                            :errors="errors"
                            v-model="imageSource.directory"
                        >
                            Source files from this folder
                        </a-folder-input>
                    </validation-provider>
                    <!-- <a-checkbox v-model="useRawDirectory">
                        Use directory itself as the input. Don't its contents?
                    </a-checkbox> -->
                    <validation-provider 
                        slim
                        :rules="{ required: isSourceADirectory }" 
                        v-slot="{ errors }"
                        v-if="isSourceADirectory"
                    >
                        <a-extensions-input
                            title="Either multiple image extensions, or json (exclusive). A comma delimited list."
                            :errors="errors"
                            v-model="imageSource.extensions"
                        >
                            Only these Extensions
                        </a-extensions-input>
                    </validation-provider>
                </div>
                <div class="column is-half-tablet">
                    <h3 class="section-title">Pipelines State</h3>
                    <div>{{ pipelineEngineStateText }}</div>
                    <h3 class="section-title" v-show="pipelineActionStateText">Action</h3>
                    <div>{{ pipelineActionStateText }}</div>
                    <!-- <div v-if="isInitializing">Initializing<wait-dots/></div> -->
                </div>
            </div>
            <div class="main-controls__drawer-toggle" :class="{ active: isMainDrawerOpen }">
                <button 
                    class="topcoat-button" 
                    type="button"
                    @click="isMainDrawerOpen = !isMainDrawerOpen"
                >Status &amp; Source <span>❱</span></button>
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
import ImageSourceType from '../server/imageSourceType';
import AFolderInput from "./a-folder-input.vue";
import AExtensionsInput from "./a-extensions-input.vue";
import ACheckbox from "./a-checkbox.vue";
import WaitDots from './wait-dots.vue';

export default {
    name: 'MainControls',
    components: {
        ValidationObserver,
        ValidationProvider,
        AFolderInput,
        AExtensionsInput,
        ACheckbox,
        WaitDots
    },
    data() {
        return {
            pipelineEngineState: Server.pipelineEngine.state,
            pipelineActionStateText: "",
            isMainDrawerOpen: store.general.isMainDrawerOpen,
            imageSource: _.simpleDeepClone(store.general.imageSource),
            imageSourceTypeOptions: [
                { text: "Active Document", value: ImageSourceType.ACTIVEDOCUMENT },
                { text: "Open Files", value: ImageSourceType.OPENFILES }, 
                { text: "Directory", value: ImageSourceType.DIRECTORY }, 
                { text: "File Watchers", value: ImageSourceType.FILEWATCHER }, 
                { text: "None", value: ImageSourceType.BLANK }
            ]
        }
    },
    watch: {
        isMainDrawerOpen: v => { store.general.isMainDrawerOpen = v; },
        imageSource: {
            deep: true, 
            handler: function(v) {
                store.general.imageSource = v;
            }
        }
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
        isSourceADirectory() {
            return this.imageSource.type == ImageSourceType.DIRECTORY;
        },
        pipelineEngineStateText() {
            return PipelineEngineState.toKey(this.pipelineEngineState);
        }
    },
    created() 
    {
        eventBus.$on("pipeline-play", pipelineName => {
            Server.pipelineEngine.run(pipelineName, this.imageSource.type, this.imageSource.directory, this.imageSource.extensions);
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
    },
    methods: {
        /**
         * Submit handler
         */
        onPipelineRun() {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "This will run all pipelines with the given source. Continue?",
                onYes: () => {
                    Server.pipelineEngine.runAll(this.imageSource.type, this.imageSource.directory, this.imageSource.extensions);
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
