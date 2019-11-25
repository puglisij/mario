<template>
    <div>
        <form id="pipelines-form"
            @submit="onConfigurationSubmit"
            novalidate="true"
        >
            <h2>Pipelines</h2>
            <div class="pipeline clearfix"
                v-for="pipeline in local.pipelines"
                v-show="!isEditorOpen || (isEditorOpen && pipelineBeingEdited.id === pipeline.id)"
                :key="pipeline.id"
            >
                <label>
                    <input class="topcoat-text-input" type="text" 
                        title="A name for the pipeline. Only used for reference."
                        placeholder="my-pipeline-name"
                        v-model="pipeline.name"
                        @change="onPipeline(pipeline.id)"
                    />
                </label>
                <label>
                    <input class="topcoat-text-input" type="text" 
                        title="The 'type' of image processes that will flow through this pipeline. Determined either by watcher default type or json 'type' property. Only one may be specified. Case insensitive."
                        placeholder="my-type-1, my-type-2"
                        v-model="pipeline.for"
                        @change="onPipeline(pipeline.id)"
                    />
                </label>
                <checkbox 
                    v-model="pipeline.disabled" 
                    @change="onPipeline(pipeline.id)">
                    Disabled 
                </checkbox>

                <button class="topcoat-icon-button--quiet" type="button"
                    @click="onToggleEditor(pipeline.id);"
                >{{ isEditorOpen ? "Close" : "Open" }} Editor</button>
                <!-- <span class="button-divider">|</span>
                <button class="topcoat-icon-button--quiet" type="button"
                    @click="onRunPipelineWithDefaults(pipeline.id);"
                >Run with Defaults</button> -->
                <button class="pipeline-delete topcoat-icon-button--quiet" type="button"
                    title="Delete this pipeline"
                    @click="onDeletePipeline(pipeline.id);"
                >X</button>
            </div>
            <div class="controls" v-if="!isEditorOpen">
                <button class="topcoat-button--large" type="submit" v-show="needSaved" @click="onSave">Save</button>
                <button class="topcoat-button--large" type="button" @click="onAddNewPipeline">Add Pipline</button>
            </div>
        </form>
        <div class="pipeline-editor" v-if="isEditorOpen">
            <h3 class="pipeline-editor-header">Editing: {{ pipelineBeingEdited.name }}</h3>
            <div class="pipeline-editor-board">
                <draggable 
                    v-model="pipelineBeingEdited.externalActions"
                    draggable=".action"
                    handle=".action-handle"
                    group="actions"
                    @change="onActionPositionChange"
                >
                    <pipeline-action 
                        v-for="(action, index) in pipelineBeingEdited.externalActions" 
                        v-model="pipelineBeingEdited.externalActions[index]"
                        :key="action.id"
                        @select-new="onActionSelectNew(index)"
                        @changed="onActionChange(index, $event)"
                        @delete="onActionDelete(index)"
                    />
                </draggable>
            </div> 
            <div class="controls">
                <button class="topcoat-button--large" type="submit" v-show="needSaved" @click="onSave">Save</button>
                <button class="topcoat-button--large" type="button" @click="onActionAdd">Add Action</button>
            </div>
            <h3 class="pipeline-editor-header">Default JSON</h3>
            <textarea class="pipeline-editor-defaults topcoat-textarea" 
                :value="pipelineBeingEditedDefaults"
                @change="onDefaultsChange"
                cols="45"
            ></textarea>
            <p class="error" v-if="pipelineDefaultsError">{{pipelineDefaultsError}}</p> 
        </div>
    </div>
</template>

<script>
/* npm modules */
import draggable from 'vuedraggable'

/* local modules */
import checkbox from "./checkbox.vue";
import pipelineAction from "./pipeline-action.vue";
import _ from "../utils";

// TODO Use Rete.js for visual node based editor. 
//      At which point it may be necessary to move this into its own lib (non Vue) and import

export default {
    name: "configurator",
    components: {
        checkbox,
        draggable,
        pipelineAction
    },
    props: {
        configuration: Object
    }, 
    data() {
        return {
            local: this.toLocalConfiguration(this.configuration),
            needSaved: false,
            pipelineBeingEdited: {}, 
            pipelineDefaultsError: ""
        };
    },
    computed: {
        pipelineBeingEditedDefaults() 
        {
            let defaults = this.pipelineBeingEdited.defaults;
            if(!this.pipelineBeingEdited.defaults || _.isEmptyObject(this.pipelineBeingEdited.defaults)) 
            {
                defaults = {
                    type: this.pipelineBeingEdited.for, 
                    image: "", 
                    package: ""
                };
            }
            this.pipelineDefaultsError = "";
            return JSON.stringify(defaults, null, 4);
        },
        isEditorOpen() {
            return !_.isEmptyObject(this.pipelineBeingEdited); 
        }
    },
    methods: {
        toLocalConfiguration(configuration)
        {
            // TODO Shouldn't be modifying prop directly
            //  Update to use .sync or clone configuration
            for(const pipeline of configuration.pipelines) 
            {
                if(!pipeline.id) {
                    pipeline.id = _.guid();
                }
                if(!pipeline.externalActions) {
                    this.$set(pipeline, 'externalActions', []);
                }
                for(const action of pipeline.externalActions) 
                {
                    if(!action.id) {
                        action.id = _.guid();
                    }
                }
            }
            return configuration;
        },
        onSave()
        {
            if(this.needSaved)
                this.$emit("changed", this.local.pipelines);
            this.needSaved = false;
        },
        markDirty() 
        {
            this.needSaved = true;
        },
        /*---------------
            Pipelines
        ---------------*/
        getPipeline: function(id) {
            return this.local.pipelines.find(x => x.id == id);
        },
        onPipeline(id)
        {
            this.markDirty();
        },
        onAddNewPipeline()
        {
            const id = _.guid();
            this.local.pipelines.push({
                id,
                for: "", 
                name: "Pipeline-Name",
                externalActions: []
            });
            this.markDirty();
        },
        onDeletePipeline(id)
        {
            this.$dialog.open({
                name: "confirm",
                onYes: () => 
                {
                    if(this.isEditorOpen && this.pipelineBeingEdited.id === id) {
                        this.closeEditor();
                    }
                    const index = this.local.pipelines.findIndex(x => x.id == id);
                    this.$delete(this.local.pipelines, index);
                }
            });
            this.markDirty();
        },
        onDefaultsChange(event) 
        {
            try {
                const defaults = JSON.parse(event.target.value);
                      defaults.type = defaults.type || this.pipelineBeingEdited.type;
                this.pipelineBeingEdited.defaults = defaults;
                this.pipelineDefaultsError = "";
                this.markDirty();
            } catch(e) {
                this.pipelineDefaultsError = e.toString();
            }
        },
        onRunPipelineWithDefaults(id)
        {
            const pipeline = _.simpleDeepClone(this.getPipeline(id));
            this.$emit("runwithdefaults", pipeline);
        },
        onToggleEditor(id) 
        {
            if(!this.isEditorOpen) 
                this.openEditor(id);
            else 
                this.closeEditor();
        },
        openEditor(id)
        {
            const pipeline = this.getPipeline(id);
            this.pipelineBeingEdited = pipeline;
        },
        closeEditor() 
        {
            this.pipelineBeingEdited = {};
        },
        /*---------------
            Actions  
        ---------------*/ 
        onActionAdd(event)
        {
            this.pipelineBeingEdited.externalActions.push({
                action: ""
            });
        },
        onActionSelectNew(index)
        {
            console.log(`Action ${index} select new.`); 
        },
        onActionChange(index, action) 
        {
            this.markDirty();
        },
        onActionDelete(index)
        {
            this.$dialog.open({
                name: "confirm",
                onYes: () => {
                    this.pipelineBeingEdited.externalActions.splice(index, 1);
                    this.markDirty();
                }
            });
        },
        onActionPositionChange(event) 
        {
            this.markDirty();
        },
        onConfigurationSubmit(event) 
        {
            event.preventDefault();
        }
    }
}
</script>

<style scoped lang="scss">

    .pipeline {
        border: none;
        border-bottom: 1px solid #333;
        margin-bottom: .5em;
        padding: .5em;

        input[type=text] {
            display: inline-block;
            margin: .25em 0;
            width: 90%;
        }
        &-delete {
            float: right;
        }
    }
    .button-divider {
        margin: 0 .5em;
    }
    
    .pipeline-editor {
        background: rgba(0,0,0,0.1);
        border-radius: 5px;
        padding: .5em;
    }
    .pipeline-editor-header {
        margin: 0;
        padding: .5em;
    }
    .pipeline-editor-board {
        position: relative;
    }
    .pipeline-editor-defaults {
        height: 400px;
        width: 100%;
    }
    .error {
        color: red;
    }
</style>