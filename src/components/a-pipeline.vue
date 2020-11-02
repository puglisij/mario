<template>
    <div class="pipeline" :class="{ disabled: disabled, collapsed: collapsed }">
        <div class="pipeline-head">
            <span 
                class="pipeline-handle"
                title="Drag to re-order"
            >&#9776;</span>
            <button 
                class="topcoat-button--large--quiet mx1" 
                type="button"
                title="Run this pipeline with its configured source(s)"
                v-if="collapsed"
                @click="onPlay"
                :disabled="disabled_"
            >&#9654;</button>
            <span 
                v-if="collapsed_"
            >{{name_}}</span>
            <button 
                class="topcoat-button--large--quiet expand right"
                type="button"
                :class="{ open: !collapsed }"
                @click="collapsed_ = !collapsed_"
            ><i>&#10097;</i></button>
        </div>

        <div class="pipeline-body" v-if="!collapsed_">
            <validation-provider
                tag="label"
                :rules="{ required: true, custom: { fn: validateName } }" 
                v-slot="{ errors }"
            >
                <div class="label">Name</div>
                <input class="topcoat-text-input full-width" type="text" 
                    title="A unique name for the pipeline."
                    placeholder="my-pipeline-name"
                    v-model="name_"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
            <validation-provider
                tag="label"
                :rules="{ required: true, custom: { fn: validateSourceNames } }" 
                v-slot="{ errors }"
            >
                <div class="label">File Source(s)</div>
                <!-- 
                    TODO: Add Autocomplete or List selection, which will eliminate need for validation here 
                    TODO: Instead allow any File source selection here
                    TODO: It's important that only a single File Producer is created for each source
                -->
                <a-array-input class="topcoat-text-input full-width" 
                    title="The file source(s) to use for inputs to this pipeline. Comma delimited."
                    placeholder="my-file-source-name"
                    v-model="sourceNames_"
                    :removeEmpty="true"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
            <a-checkbox v-model="disabled_">
                Disabled 
            </a-checkbox>
            <button 
                class="topcoat-button--large--quiet" 
                type="button"
                title="Run this pipeline with its configured source(s)"
                @click="onPlay"
                @disabled="disabled_"
                :disabled="disabled_"
            >&#9654;</button>
            <button 
                class="topcoat-button--large--quiet" 
                type="button"
                @click="onEdit"
            >Edit</button>
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
        sourceNames: {
            type: Array, 
            required: true
        },
        disabled: {
            type: Boolean,
            required: true
        },
        collapsed: {
            type: Boolean,
            required: true
        },
        pipelines: {
            type: Array, 
            required: true
        }
    }, 
    computed: {
        name_: {
            get() { return this.name; },
            set(v) { this.$emit("update:name", v); }
        },
        sourceNames_: {
            get() { return _.simpleDeepClone(this.sourceNames); },
            set(v) { this.$emit("update:sourceNames", v); }
        },
        disabled_: {
            get() { return this.disabled; },
            set(v) { this.$emit("update:disabled", v); }
        },
        collapsed_: {
            get() { return this.collapsed; },
            set(v) { this.$emit("update:collapsed", v); }
        }
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
        validateSourceNames(names) 
        {
            // Ensure file source exists by each name
            const missingNames = names.filter(n => {
                // TODO: Remove reference to store here
                return !store.general.fileSources.find(w => w.name === n); 
            });
            return {
                valid: missingNames.length === 0,
                message: `A file source by name '${missingNames.pop()}' does not exist.`
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