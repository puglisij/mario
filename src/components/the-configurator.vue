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
            @submit.prevent="handleSubmit(onConfigurationSubmit)"
        >
            <h2 class="tab-title">Configuration<i v-show="needSaved">*</i></h2>
            <section class="section-content">
                <label>
                    <div class="label">Custom Actions Folder</div>
                    <validation-provider 
                        class="flex"
                        tag="div"
                        rules="pathunc:false|pathexists" 
                        v-slot="v"
                    >
                        <a-folder-dialog-button :folder.sync="pathToUserActions" @update:folder="onPathToUserActions"></a-folder-dialog-button>
                        <input 
                            class="topcoat-text-input flex-grow ml1" 
                            type="text" 
                            placeholder="/my/custom/jsx/actions" 
                            title="The path to the directory containing custom extendscript actions"
                            v-model="pathToUserActions"
                            @change="onPathToUserActions"
                        />
                        <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
                    </validation-provider>
                </label>
                <div class="configurator-buttons">
                    <button 
                        class="topcoat-button--large"
                        type="button"
                        @click.prevent="onReloadActions"
                        v-show="!isLoadingActions"
                    >Reload Actions</button>
                    <wait-dots v-show="isLoadingActions" />
                </div>
            </section>
            <h3 class="section-title">File Sources</h3>
            <section class="section-content">
                <a-file-source
                    v-for="(source, index) in fileSources"
                    :key="source.id"
                    v-model="fileSources[index]"
                    :sources="fileSources"
                    @change="onSourceChange"
                    @delete="onDeleteSource"
                ></a-file-source>
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

import _ from "../utils";
import store from "../store";
import eventBus from "../eventBus"; 
import AFolderDialogButton from "./a-folder-dialog-button.vue";
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
        ValidationObserver,
        ValidationProvider,
        AFolderDialogButton,
        ACheckbox,
        AFileSource,
        WaitDots
    },
    data: () => {
        return {
            needSaved: false, 
            isLoadingActions: false,
            pathToUserActions: store.general.pathToUserActions,
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
        onPathToUserActions(event)
        {
            this.markForSave();
        },
        onSourceChange(newSource)
        {
            this.markForSave();
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
            store.general.pathToUserActions = this.pathToUserActions;
            store.general.fileSources = _.simpleDeepClone(this.fileSources);
            eventBus.$emit("filesource-update");
            this.$emit('changed');
            this.needSaved = false;
        }
    }
}
</script>
