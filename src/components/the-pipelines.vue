<template>
    <div class="pipelines">
        <h2 class="tab-title">Pipelines</h2>
        
        <a-checkbox v-model="pauseAfterEveryPipeline" @change="markForSave">
            Pause processing after every Pipeline?
        </a-checkbox>
        <a-checkbox v-model="pauseAfterEveryAction" @change="markForSave">
            Pause processing after every Pipeline Action?
        </a-checkbox>
        <a-checkbox v-model="pauseAfterEveryImage" @change="markForSave">
            Pause processing after every Image?
        </a-checkbox>
        <a-checkbox v-model="pauseOnExceptions" @change="markForSave">
            Pause processing on errors?
        </a-checkbox>

        <h3 class="section-title">Pipelines</h3>
        <validation-observer 
            ref="observer"
            slim
            v-slot="{ handleSubmit }"
        >
            <form 
                novalidate="true"
                @keydown.enter.prevent
                @submit.prevent="handleSubmit(onConfigurationSubmit)"
            >
                <draggable 
                    v-model="pipelines"
                    group="pipelines" 
                    @change="markForSave"
                >
                    <a-pipeline
                        v-for="(pipeline, index) in pipelines"
                        v-show="!isEditorOpen || (isEditorOpen && pipelineBeingEdited.id === pipeline.id)"
                        v-model="pipelines[index]"
                        :key="pipeline.id"
                        @delete="onPipelineDelete"
                        @edit="onPipelineEdit"
                        @play="onPipelinePlay"
                    >
                    </a-pipeline>
                </draggable>
                <div class="pipeline-buttons" v-if="!isEditorOpen">
                    <button class="topcoat-button--large" type="button" @click="onPipelineAdd">Add Pipline</button>
                    <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
                </div>
            </form>
        </validation-observer>

        <div class="pipeline-editor" v-if="isEditorOpen">
            <h3 class="pipeline-editor-header">Editing: {{ pipelineBeingEdited.name }}</h3>
            <div class="pipeline-editor-board">
                <draggable 
                    v-model="pipelineBeingEdited.actions"
                    draggable=".action"
                    handle=".action-handle"
                    group="actions"
                    @change="onActionPositionChange"
                >
                    <pipeline-action 
                        v-for="(action, index) in pipelineBeingEdited.actions" 
                        v-model="pipelineBeingEdited.actions[index]"
                        :key="action.id"
                        @select-new="onActionSelectNew"
                        @changed="onActionChange"
                        @delete="onActionDelete"
                    />
                </draggable>
            </div> 
            <div class="pipeline-buttons">
                <button class="topcoat-button--large" type="button" @click="onActionAdd">Add Action</button>
                <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ValidationObserver } from "vee-validate";
import Draggable from 'vuedraggable'

import _ from "../utils";
import store from "../store"; 
import ACheckbox from "./a-checkbox.vue";
import APipeline from "./a-pipeline.vue";
import APipelineAction from "./a-pipeline-action.vue";


export default {
    name: "ThePipelines",
    components: {
        ValidationObserver,
        Draggable,
        ACheckbox,
        APipeline,
        APipelineAction
    },
    data() {
        return {
            needSaved: false,
            pauseAfterEveryPipeline: store.general.pauseAfterEveryPipeline,
            pauseAfterEveryAction: store.general.pauseAfterEveryAction,
            pauseAfterEveryImage: store.general.pauseAfterEveryImage,
            pauseOnExceptions: store.general.pauseOnExceptions,
            pipelines: this.toLocalPipelines(store.pipelines.pipelines),
            pipelineBeingEdited: {}
        };
    },
    computed: {
        isEditorOpen() {
            return !_.isEmptyObject(this.pipelineBeingEdited); 
        }
    },
    methods: {
        markForSave() 
        {
            this.needSaved = true;
        },
        toLocalPipelines(value)
        {
            const pipelines = _.simpleDeepClone(value);
            // Ensure id's
            for(const pipeline of pipelines) {
                pipeline.id = pipeline.id || _.guid();
                for(const action of pipeline.actions) {
                    action.id = action.id || _.guid();
                }
            }
            return pipelines;
        },
        onConfigurationSubmit()
        {
            this.needSaved = false;
            store.pipelines.pipelines = this.pipelines;
        },
        /*---------------
            Pipelines
        ---------------*/
        getPipeline: function(id) {
            return this.pipelines.find(x => x.id == id);
        },
        onPipelineAdd()
        {
            this.pipelines.push({
                id: _.guid(),
                name: "",
                watcherNames: "", 
                disabled: false,
                actions: []
            });
            this.markForSave();
        },
        onPipelineEdit(id)
        {
            this.openEditor(id);
        },
        onPipelinePlay(id)
        {

        },
        onPipelineDelete(id)
        {
            this.$dialog.open({
                name: "confirm",
                onYes: () => {
                    if(this.isEditorOpen && this.pipelineBeingEdited.id === id) {
                        this.closeEditor();
                    }
                    this.pipelines = this.pipelines.filter(x => x.id != id);
                    this.markForSave();
                }
            });
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
            this.pipelineBeingEdited.actions.push({
                id: _.guid(),
                action: ""
            });
        },
        onActionSelectNew(index)
        {
            console.log(`Action ${index} select new.`); 
        },
        onActionChange(index, action) 
        {
            this.markForSave();
        },
        onActionDelete(index)
        {
            this.$dialog.open({
                name: "confirm",
                onYes: () => {

                    this.pipelineBeingEdited.actions.splice(index, 1);
                    this.markForSave();
                }
            });
        },
        onActionPositionChange(event) 
        {
            this.markForSave();
        }
    }
}
</script>
