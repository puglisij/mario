<template>
    <div class="pipeline">
        <label>
            <div class="label">Name</div>
            <validation-provider
                rules="required" 
                v-slot="{ errors }"
            >
                <input class="topcoat-text-input full-width" type="text" 
                    title="A name for the pipeline. Only used for reference."
                    placeholder="my-pipeline-name"
                    v-model="localPipeline.name"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
        </label>
        <label>
            <div class="label">File Watcher(s)</div>
            <validation-provider
                :rules="{ custom: { fn: validateWatcherNames } }" 
                v-slot="{ errors }"
            >
                <input class="topcoat-text-input full-width" type="text" 
                    title="The file watcher(s) to use for inputs to this pipeline. Comma delimited."
                    placeholder="my-watcher-name"
                    v-model="localPipeline.watcherNames"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
        </label>
        <a-checkbox v-model="localPipeline.disabled">
            Disabled 
        </a-checkbox>
        <button 
            class="topcoat-button--large--quiet" 
            type="button"
            @click="onEdit"
        >Edit</button>
        <button 
            class="topcoat-button--large--quiet" 
            type="button"
            title="Process open files with this pipeline"
            @click="onPlay"
        >&#9654;</button>
        <button 
            class="topcoat-button--large--quiet" 
            type="button"
            title="Delete this pipeline"
            @click="onDelete"
        >X</button>
    </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";

import _ from "../utils";
import store from "../store"; 
import ACheckbox from "./a-checkbox.vue";


export default {
    name: "APipeline",
    components: {
        ValidationProvider,
        ACheckbox
    },
    model: {
        prop: "pipeline", 
        event: "changed"
    },
    props: {
        pipeline: {
            type: Object, 
            required: true
        }
    }, 
    data() {
        return { 
            localPipeline: _.simpleDeepClone(this.pipeline)
        };
    },
    watch: {
        localPipeline: {
            deep: true,
            handler: function(v) {
                this.$emit("changed", v);
            }
        }
    },
    methods: {
        validateWatcherNames(value) 
        {
            // Remove whitespace
            const names = value.split(",").map(n => n.trim()).filter(n => !_.isEmptyString(n));
            // Update model 
            this.localPipeline.watcherNames = names.join(","); 
            // Ensure watcher exists by each name
            const missingNames = names.filter(n => {
                return !store.general.fileWatchers.find(w => w.name === n); 
            });
            return {
                valid: missingNames.length === 0,
                message: `A File Watcher by name '${missingNames.pop()}' does not exist.`
            };
        },
        onEdit() {
            this.$emit("edit", this.pipeline.id);
        },
        onPlay() {
            this.$emit("play", this.pipeline.id);
        },
        onDelete() {
            this.$emit("delete", this.pipeline.id);
        }
    }
}
</script>