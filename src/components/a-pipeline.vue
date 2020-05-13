<template>
    <div class="pipeline" :class="{ disabled: disabled }">
        <span class="pipeline-handle"
            title="Drag to re-order">&#9776;</span>

        <div class="pipeline-data">
            <validation-provider
                tag="label"
                :rules="{ required: true, custom: { fn: validateName } }" 
                v-slot="{ errors }"
            >
                <div class="label">Name</div>
                <input class="topcoat-text-input full-width" type="text" 
                    title="A name for the pipeline. Only used for reference."
                    placeholder="my-pipeline-name"
                    v-model="name_"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
            <validation-provider
                tag="label"
                :rules="{ custom: { fn: validateWatcherNames } }" 
                v-slot="{ errors }"
            >
                <div class="label">File Watcher(s)</div>
                <!-- 
                    TODO: Add Autocomplete or List selection, which will eliminate need for validation here 
                    TODO: Don't force a Pipeline to use a File Watcher. Instead allow any File source selection here
                    TODO: It's important that only a single File Producer is created for each source
                -->
                <a-array-input class="topcoat-text-input full-width" 
                    title="The file watcher(s) to use for inputs to this pipeline. Comma delimited."
                    placeholder="my-watcher-name"
                    v-model="watcherNames_"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
            <a-checkbox v-model="disabled_">
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
    </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";

import _ from "../utils";
import store from "../store"; 
import ACheckbox from "./a-checkbox.vue";
import AArrayInput from "./a-array-input.vue";

export default {
    name: "APipeline",
    components: {
        ValidationProvider,
        ACheckbox,
        AArrayInput
    },
    props: {
        id: {
            type: String, 
            required: true
        },
        name: {
            type: String, 
            required: true
        },
        watcherNames: {
            type: Array, 
            required: true
        },
        disabled: {
            type: Boolean,
            required: true
        },
        // 
        pipelines: {
            type: Array, 
            required: true
        }
    }, 
    data() {
        return {
            name_: this.name,
            watcherNames_: this.watcherNames,
            disabled_: this.disabled
        }
    },
    watch: {
        name_:          function(v) { this.$emit("update:name", v); },
        watcherNames_:  function(v) { this.$emit("update:watcherNames", v); },
        disabled_:      function(v) { this.$emit("update:disabled", v); },
    },
    methods: {
        validateName(value)
        {
            const name = value.trim();
            this._name = name;
            const found = this.pipelines.filter(w => w.name == name).length;
            return {
                valid: found === 1, 
                message: "Pipeline name must be unique"
            };
        },
        validateWatcherNames(names) 
        {
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
            this.$emit("pipeline-edit", this.id);
        },
        onPlay() {
            this.$emit("pipeline-play", this.id);
        },
        onDelete() {
            this.$emit("pipeline-delete", this.id);
        }
    }
}
</script>