<template>
    <div>
        <form id="pipelines-form"
            @submit="onConfigurationSubmit"
            novalidate="true"
        >
            <h2>Pipelines</h2>
            <div class="pipeline clearfix"
                v-for="pipeline in configuration.pipelines"
                :key="pipeline.id"
            >
                <checkbox v-model="pipeline.doImagesRequireMetadataFile" @change="onPipeline">
                    Require meta data file
                </checkbox>
                <input class="topcoat-text-input" type="text" placeholder="my-pipeline-name"
                    v-model="pipeline.name"
                    @change="onPipeline"
                />
                <br/>
                <input class="topcoat-text-input" type="text" placeholder="my-type-1, my-type-2"
                    v-model="pipeline.for"
                    @change="onPipeline"
                />

                <button class="topcoat-icon-button--quiet" type="button"
                    @click="onOpenEditor($event, pipeline.id);"
                >Open Editor</button>
                <button class="pipeline-delete topcoat-icon-button--quiet" type="button"
                    @click="onDeletePipeline($event, pipeline.id);"
                >X</button>
            </div>
            <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
            <button class="topcoat-button--large" type="button" @click="onAddNewPipeline">Add Pipline</button>
        </form>
        <div class="pipeline-editor" v-if="isEditorOpen">
            <h3>Editor</h3>
            <div class="pipeline-editor-board">
                <draggable 
                    :list="pipelineBeingEdited.externalActions" 
                    :move="onActionSort"
                    draggable=".action"
                    handle=".action-handle"
                    group="actions"
                >

                    <div class="action" 
                        v-for="(action, index) in pipelineBeingEdited.externalActions" 
                        :key="action.action"
                    >
                        <span class="action-handle">&#9776;</span>
                        <div class="action-data">
                            <input class="topcoat-text-input" type="text" placeholder="the action string (e.g. 'action.saveDocument')"
                                v-model="action.action"
                            />
                            <div>
                                Parameters
                            </div>
                        </div>
                        <button class="action-delete topcoat-icon-button--quiet" type="button" @click="onActionDelete(index)">X</button>
                    </div>
                </draggable>
            </div>
            <button class="topcoat-button--large" type="button" @click="onAddNewPipeline">Add Action</button>
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

// TODO move editor into its own lib (non Vue) and import

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
    data: () => ({
        needSaved: false,
        isEditorOpen: false,
        pipelineBeingEdited: {}
    }),
    methods: {
        getPipeline: function(id) {
            return this.configuration.pipelines.find(x => x.id == id);
        },
        onPipeline(event)
        {
            this.needSaved = true;

        },
        onAddNewPipeline(event)
        {
            const guid = _.guid();
            
        },
        onDeletePipeline(event, id)
        {

            // remove from editor if being edited
        },
        onOpenEditor(event, id)
        {
            const pipeline = this.getPipeline(id);
            this.pipelineBeingEdited = pipeline;
            this.isEditorOpen = true;
        },
        onActionDelete(index)
        {
            this.$dialog.open({
                name: "confirm",
                onYes: () => {
                    this.pipelineBeingEdited.externalActions.splice(index, 1);
                }
            });
        },
        onActionSort(event, originalEvent) 
        {
            console.log(`Action position changed: ${event.draggedContext.index} to ${event.relatedContext.index}`)
        },
        onConfigurationSubmit(event) 
        {
            event.preventDefault();
            this.$emit('update:pipelines', this.configuration.pipelines);
            this.needSaved = false;
        }
    }
}
</script>

<style scoped lang="scss">

    .pipeline {
        border: none;
        border-bottom: 1px solid #333;
        padding: .5em;

        input[type=text] {
            margin: .5em 0;
        }
        &:last-of-type {
            margin-bottom: .5em;
        }
        &-delete {
            float: right;
        }
    }

    h3 {
        margin: .5em;
    }
    input[type=text] {
        display: inline-block;
        width: 90%;
    }

    .pipeline-editor {
        border-top: 1px solid #333;
        margin-top: .5em;

        h3 {
            font-weight: bold;
        }
    }
    .pipeline-editor-board {
        position: relative;
    }

</style>