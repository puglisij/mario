<template>
    <validation-observer 
        ref="observer"
        slim
        v-slot="{ handleSubmit }"
    >
        <form 
            class="pipelines"
            novalidate="true"
            @keydown.enter.prevent
            @submit.prevent="handleSubmit(onConfigurationSubmit)"
        >
            <h2 class="tab-title">Pipelines</h2>

            <a-checkbox v-model="pauseAfterEveryPipeline">
                Pause processing after every Pipeline?
            </a-checkbox>
            <a-checkbox v-model="pauseAfterEveryAction">
                Pause processing after every Pipeline Action?
            </a-checkbox>
            <a-checkbox v-model="pauseAfterEveryImage">
                Pause processing after every Image?
            </a-checkbox>
            <a-checkbox v-model="pauseOnExceptions">
                Pause processing on errors?
            </a-checkbox>
            <a-checkbox v-model="doReadFileMetadata">
                Read metadata for every file?
            </a-checkbox>

            <div v-if="!isEditorOpen">
                <h3 class="section-title">Pipelines</h3>
                <draggable 
                    v-model="pipelines"
                    group="pipelines" 
                >
                    <a-pipeline
                        v-for="pipeline in pipelines"
                        :key="pipeline.id"
                        :id.sync="pipeline.id"
                        :name.sync="pipeline.name"
                        :watcherNames.sync="pipeline.watcherNames"
                        :disabled.sync="pipeline.disabled"
                        :pipelines="pipelines"
                        @pipeline-delete="onPipelineDelete"
                        @pipeline-edit="onPipelineEdit"
                        @pipeline-play="onPipelinePlay"
                    />
                </draggable>
            </div>

            <div v-else>
                <h3 class="section-title">Actions Editor</h3>
                <p class="text-highlight mt0">Editing: {{ pipelineBeingEdited.name }}</p>

                <draggable 
                    v-model="pipelineBeingEdited.actions"
                    draggable=".action"
                    handle=".action-handle"
                    group="actions"
                >
                    <a-pipeline-action 
                        v-for="(action, index) in pipelineBeingEdited.actions" 
                        v-model="pipelineBeingEdited.actions[index]"
                        :key="action.id"
                        @delete="onActionDelete"
                    />
                </draggable>
            </div>

            <div class="pipeline-buttons">
                <button class="topcoat-button--large" type="button" @click="onPipelineAdd" v-show="!isEditorOpen">Add Pipline</button>
                <button class="topcoat-button--large" type="button" @click="onActionAdd" v-show="isEditorOpen">Add Action</button>
                <button class="topcoat-button--large" type="button" @click="onEditorClose" v-show="isEditorOpen">Close</button>
                <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
            </div>
        </form>
    </validation-observer>
</template>

<script>
import { ValidationObserver } from "vee-validate";
import Draggable from 'vuedraggable';

import _ from "../utils";
import store from "../store"; 
import eventBus from "../eventBus";
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
            pauseAfterEveryPipeline: store.general.pauseAfterEveryPipeline,
            pauseAfterEveryAction: store.general.pauseAfterEveryAction,
            pauseAfterEveryImage: store.general.pauseAfterEveryImage,
            pauseOnExceptions: store.general.pauseOnExceptions,
            doReadFileMetadata: false,
            pipelines: this.toLocalPipelines(store.pipelines.pipelines),
            needSaved: false,
            pipelineBeingEdited: {}
        };
    },
    computed: {
        isEditorOpen() {
            return !_.isEmptyObject(this.pipelineBeingEdited); 
        }
    },
    watch: {
        // TODO This pattern kinds stinks?
        pauseAfterEveryPipeline: function(v) { store.general.pauseAfterEveryPipeline = v; },
        pauseAfterEveryAction: function(v) { store.general.pauseAfterEveryAction = v; },
        pauseAfterEveryImage: function(v) { store.general.pauseAfterEveryImage = v; },
        pauseOnExceptions: function(v) { store.general.pauseOnExceptions = v; },
        doReadFileMetadata: function(v) { store.general.doReadFileMetadata = v; },
        pipelines: {
            deep: true,
            handler: function(value) {
                this.needSaved = true;
            }
        }
    },
    methods: {
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
            store.pipelines.pipelines = this.pipelines;
            this.needSaved = false;
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
                watcherNames: [], 
                disabled: false,
                actions: []
            });
        },
        onPipelineEdit(id)
        {
            this.openEditor(id);
        },
        async onPipelinePlay(id)
        {
            const isValid = await this.$refs.observer.validate();
            if(isValid) {
                eventBus.$emit("pipeline-play", this.getPipeline(id).name);
            }
        },
        onPipelineDelete(id)
        {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "Delete this pipeline?",
                onYes: () => {
                    if(this.isEditorOpen && this.pipelineBeingEdited.id === id) {
                        this.closeEditor();
                    }
                    this.pipelines = this.pipelines.filter(x => x.id !== id);
                }
            });
        },
        /*---------------
            Editor
        ---------------*/
        onEditorClose() 
        {
            // if(!this.needSaved) {
                this.closeEditor();
            //    return;
            // }
            // this.$dialog.openConfirm({
            //     name: "confirm",
            //     message: "Close editor without saving changes?",
            //     onYes: () => {
            //         this.closeEditor();
            //     }
            // });
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
        onActionAdd(event)
        {
            // TODO: Action name should be selected from a list and non-editable
            // TODO: Action parameters should be fixed/baked-in and only values editable
            this.pipelineBeingEdited.actions.push({
                id: _.guid(),
                actionName: ""
            });
        },
        onActionDelete(id)
        {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "Delete this action?",
                onYes: () => {
                    const actions = this.pipelineBeingEdited.actions.filter(a => a.id !== id);
                    this.pipelineBeingEdited.actions = actions;
                }
            });
        }
    }
}
</script>
