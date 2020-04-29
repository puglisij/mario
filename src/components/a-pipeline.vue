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
                    v-model="name_"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
        </label>
        <label>
            <div class="label">File Watcher(s)</div>
            <!-- TODO: Add Autocomplete or List selection, which will eliminate need for validation here -->
            <validation-provider
                :rules="{ custom: { fn: validateWatcherNames } }" 
                v-slot="{ errors }"
            >
                <input class="topcoat-text-input full-width" type="text" 
                    title="The file watcher(s) to use for inputs to this pipeline. Comma delimited."
                    placeholder="my-watcher-name"
                    v-model="watcherNames_"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
        </label>
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
            type: String, 
            required: true
        },
        disabled: {
            type: Boolean,
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
        validateWatcherNames(value) 
        {
            // Remove whitespace
            const names = value.split(",").map(n => n.trim()).filter(n => !_.isEmptyString(n));
            // Update model 
            this.watcherNames_ = names.join(","); 
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
            this.$emit("edit", this.id);
        },
        onPlay() {
            this.$emit("play", this.id);
        },
        onDelete() {
            this.$emit("delete", this.id);
        }
    }
}
</script>