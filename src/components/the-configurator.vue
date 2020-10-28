<template>
    <validation-observer 
        ref="observer"
        slim
        v-slot="{ handleSubmit }"
    >
        <form 
            class="configurator"
            novalidate="true"
            @keydown.enter.prevent
            @change="markForSave"
            @submit.prevent="handleSubmit(onConfigurationSubmit)"
        >
            <h2 class="tab-title">Configuration<i v-show="needSaved">*</i></h2>

            <h3 class="section-title">Actions</h3>
            <section class="section-content section-content--inset section-content--actions">
                <validation-provider 
                    slim
                    :rules="{ 
                        pathunc: false, 
                        pathrelative: { allowed: false },
                        pathexists: true }" 
                    v-slot="{ errors }"
                >
                    <a-folder-input
                        title="The path to the directory containing custom extendscript actions"
                        placeholder="/my/custom/jsx/actions"
                        :errors="errors"
                        v-model="pathToUserActions"
                    >
                        Custom Actions Folder
                    </a-folder-input>
                </validation-provider>

                <div class="configurator-buttons">
                    <button 
                        class="topcoat-button--large"
                        type="button"
                        @click.prevent="onReloadActions"
                        v-show="!isLoadingActions"
                    >Reload Actions</button>
                    <wait-dots v-if="isLoadingActions" />
                </div>
            </section>

            <h3 class="section-title">Logs</h3>
            <section class="section-content section-content--inset">
                <validation-provider 
                    slim
                    :rules="{ 
                        pathunc: false, 
                        pathrelative: { allowed: false },
                        pathexists: true }" 
                    v-slot="{ errors }"
                >
                    <a-folder-input
                        class="mb1"
                        title="The path to the directory where console log files will be written"
                        placeholder="/my/log/files" 
                        :errors="errors"
                        v-model="logDirectory"
                    >
                        Log File Folder
                    </a-folder-input>
                </validation-provider>

                <validation-provider
                    tag="label"
                    rules="required|integer:0,365"
                    v-slot="{ errors }"
                >
                    <div class="label">Number of Days to Persist Log Files</div>
                    <input 
                        class="topcoat-text-input input-days" 
                        type="number" 
                        title="An integer value"
                        v-model="logFilePersistForDays"
                    />
                    <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
                </validation-provider>
            </section>

            <h3 class="section-title">Http Server</h3>
            <section class="section-content section-content--inset">
                <a-checkbox v-model="runHttpServer">
                    Run a server instance (REST api)?
                </a-checkbox>
                <validation-provider
                    tag="label"
                    rules="required|integer:0,65353"
                    v-slot="{ errors }"
                >
                    <div class="label">Port Number</div>
                    <input 
                        class="topcoat-text-input input-server-port" 
                        type="number" 
                        title="An integer value"
                        v-model="serverPort"
                    />
                    <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
                </validation-provider>
            </section>

            <h3 class="section-title">File Sources</h3>
            <section class="section-content">
                <draggable 
                    v-model="fileSources"
                    draggable=".source"
                    handle=".source-handle"
                    group="fileSources" 
                >
                    <a-file-source
                        v-for="(source, index) in fileSources"
                        :key="source.id"
                        v-model="fileSources[index]"
                        :sources="fileSources"
                        @delete="onDeleteSource"
                    ></a-file-source>
                </draggable>
            </section>
            <div class="configurator-buttons">
                <button 
                    class="topcoat-button--large" 
                    type="button"
                    @click.prevent="onAddNewSource"
                >Add File Source</button>
                <button 
                    class="topcoat-button--large"
                    type="submit" 
                    v-show="needSaved" 
                    ref="save"
                >Save</button>
            </div>
        </form>
    </validation-observer>
</template>

<script>
import { ValidationProvider, ValidationObserver } from "vee-validate";
import Draggable from 'vuedraggable';

import _ from "../utils";
import store from "../store";
import eventBus from "../eventBus"; 
import AFolderInput from "./a-folder-input.vue";
import ACheckbox from "./a-checkbox.vue";
import AFileSource from "./a-file-source.vue";
import WaitDots from './wait-dots.vue';
import Server from '../server';

/**
 * General Application Configuration
 */
export default {
    name: "TheConfigurator",
    components: {
        Draggable,
        ValidationObserver,
        ValidationProvider,
        AFolderInput,
        ACheckbox,
        AFileSource,
        WaitDots
    },
    data: () => {
        return {
            needSaved: false, 
            isLoadingActions: false,
            runHttpServer: store.general.runHttpServer,
            serverPort: store.general.serverPort,
            pathToUserActions: store.general.pathToUserActions,
            logDirectory: store.general.logDirectory,
            logFilePersistForDays: store.general.logFilePersistForDays,
            fileSources: _.simpleDeepClone(store.general.fileSources)
        }
    },
    methods: {
        markForSave: function(el) {
            this.needSaved = true;
        },
        async onReloadActions(event)
        {
            this.isLoadingActions = true;
            await Server.actions.init();
            this.isLoadingActions = false;
        },
        updatePipelineFileSourceReferences() 
        {
            // We look at on-disk settings 'before' saving, in order to determine what needs updated
            // TODO: A change to the GUI to allow selection from a fixed list of file sources
            // may eliminate some of this foolery
            let pipelines = _.simpleDeepClone(store.pipelines.pipelines);
            let fileSources = _.simpleDeepClone(store.general.fileSources);

            // Remove pipeline references to deleted file sources
            // Update pipeline references to renamed file sources
            pipelines.forEach(p => 
            {
                let sourceNames = [];
                for(let i = 0; i < p.sourceNames.length; ++i) 
                {
                    // ASSERT: Should always find an original source for this name
                    // assuming that the Pipelines configuration interface disallows 
                    // source names which do not exist
                    const sourceName = p.sourceNames[i];
                    const sourceId = fileSources.find(s => s.name === sourceName).id;
                    const source = this.fileSources.find(s => s.id === sourceId);
                    if(source) {
                        sourceNames.push(source.name);
                    }
                }
                p.sourceNames = sourceNames;
            });
  
            // Save to disk
            store.pipelines.pipelines = pipelines;
            store.pipelines.save();
        },
        onAddNewSource(event)
        { 
            let source = {
                id: _.guid(),
                name: "",
                type: -1,
                sourceDirectory: "",
                sourceExtensions: [],
                useProcessedDirectory: false,
                processedDirectory: "",
                useOutputDirectory: false,
                outputDirectory: "",
                useErrorDirectory: false,
                errorDirectory: ""
            };
            this.fileSources.push(source);
        },
        onDeleteSource(id)
        {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "Delete this file source?",
                onYes: () => {
                    this.fileSources = this.fileSources.filter(w => w.id != id);
                    this.markForSave();
                }
            })
        },
        onConfigurationSubmit(event)
        {
            this.updatePipelineFileSourceReferences();
            store.general.runHttpServer = this.runHttpServer;
            store.general.serverPort = this.serverPort;
            store.general.pathToUserActions = this.pathToUserActions;
            store.general.logDirectory = this.logDirectory;
            store.general.logFilePersistForDays = parseInt(this.logFilePersistForDays, 10);
            store.general.fileSources = _.simpleDeepClone(this.fileSources);
            eventBus.$emit("filesource-update");
            this.$emit('changed');
            this.needSaved = false;
        }
    }
}
</script>

<style lang="scss">
    .configurator {
        .section-content--actions {
            background: rgba(170, 187, 255, 0.1);
        }
        .input-days {
            width: 50px;
        }
        .input-server-port {
            width: 80px
        }
    }
</style>