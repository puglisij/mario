<template>
    <div class="watcher">
        <label>
            <div class="label">Name</div>
            <validation-provider 
                :rules="{ required: true, custom: { fn: validateName } }" 
                v-slot="{ errors }"
            >
                <input class="topcoat-text-input full-width" type="text" placeholder="My Watcher Name" 
                    title="This is referenced by Pipelines"
                    v-model="localWatcher.name"
                />
                <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
            </validation-provider>
        </label>

        <validation-provider 
            slim
            rules="required|pathexists" 
            v-slot="{ errors }"
        >
            <a-folder-input
                title="The path to the folder to watch for new json files, or images for processing."
                :errors="errors"
                v-model="localWatcher.path"
            >
                Watch this Folder
            </a-folder-input>
        </validation-provider>

        <a-checkbox v-model="localWatcher.useProcessedPath">
            Use Processed Folder?
        </a-checkbox>

        <validation-provider 
            slim
            :rules="{ required: localWatcher.useProcessedPath, pathexists: true }" 
            v-slot="{ errors }"
            v-if="localWatcher.useProcessedPath"
        >
            <a-folder-input
                title="Files in the watch folder will be moved here after pipeline(s) have run."
                :errors="errors"
                v-model="localWatcher.processedPath"
            >
                Move processed files to this Folder
            </a-folder-input>
        </validation-provider>

        <validation-provider 
            slim
            rules="required" 
            v-slot="{ errors }"
        >
            <a-extensions-input 
                title="Either multiple image extensions, or json (exclusive). A comma delimited list."
                :errors="errors"
                v-model="localWatcher.extensions"
            >   
                Watch these Extensions
            </a-extensions-input>
        </validation-provider>
        
        <button class="topcoat-button--large--quiet" type="button"
            @click.prevent="onDelete"
        >X</button>
    </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";

import _ from "../utils";
import AFolderInput from "./a-folder-input.vue";
import AExtensionsInput from "./a-extensions-input.vue";
import ACheckbox from "./a-checkbox.vue";

export default {
    name: "AWatcher",
    components: {
        ValidationProvider,
        AFolderInput,
        AExtensionsInput,
        ACheckbox
    },
    model: {
        prop: "watcher", 
        event: "changed"
    },
    props: {
        watchers: {
            type: Array,
            required: true
        },
        watcher: {
            type: Object, 
            required: true
        }
    },  
    data() {
        return {
            localWatcher: _.simpleDeepClone(this.watcher)
        }
    },
    watch: {
        localWatcher: {
            deep: true,
            handler: function(v) {
                this.$emit("changed", v);
            }
        }
    },
    methods: {
        // TODO: Validate that a watcher does not exist already for watched path
        // Multiple file producers for the same files can cause issues.
        validateName(value)
        {
            const name = value.trim();
            this.localWatcher.name = name;
            const found = this.watchers.filter(w => w.name == name).length;
            // TODO: Warn if Pipelines are referencing last watcher name
            return {
                valid: found === 1, 
                message: "Name must be unique"
            };
        },
        onDelete(event)
        {
            this.$emit("delete", this.localWatcher.id);
        }
    }
}
</script>
