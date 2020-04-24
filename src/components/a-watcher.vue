<template>
    <div class="watcher">
        <label>
            <div class="label">Name</div>
            <validation-provider 
                :rules="{ required: true, custom: { fn: validateName } }" 
                v-slot="v"
            >
                <input class="topcoat-text-input full-width" type="text" placeholder="My Watcher Name" 
                    title="This is referenced by Pipelines"
                    v-model="localWatcher.name"
                />
                <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
            </validation-provider>
        </label>

        <label>
            <div class="label">Watch this Folder</div>
            <validation-provider 
                class="flex" 
                rules="required|pathexists" 
                v-slot="v"
            >
                <a-folder-dialog-button v-model="localWatcher.path"></a-folder-dialog-button>
                <input class="topcoat-text-input full-width ml1" type="text" placeholder="/my/watch/folder" 
                    title="The path to the folder to watch for new json files, or images for processing."
                    v-model="localWatcher.path"
                    @focus="v.reset"
                />
                <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
            </validation-provider>
        </label>

        <a-checkbox v-model="localWatcher.useProcessedPath">
            Use Processed Folder?
        </a-checkbox>

        <label v-if="localWatcher.useProcessedPath">
            <div class="label">Move processed files to this Folder</div>
            <validation-provider 
                class="flex" 
                :rules="{ required: localWatcher.useProcessedPath, pathexists: true }" 
                v-slot="v"
            >
                <a-folder-dialog-button v-model="localWatcher.processedPath"></a-folder-dialog-button>
                <input class="topcoat-text-input full-width ml1" type="text" placeholder="/my/processed/folder" 
                    title="Files in the watch folder will be moved here after pipeline(s) have run."
                    v-model="localWatcher.processedPath"
                    @focus="v.reset"
                />
                <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
            </validation-provider>
        </label>

        <label>
            <div class="label">Watch these Extensions</div>
            <validation-provider 
                class="flex" 
                rules="required" 
                v-slot="v"
            >
                <input class="topcoat-text-input full-width" type="text" placeholder="jpg, jpeg, png, psd, tif, etc." 
                    title="Either multiple image extensions, or json (exclusive). A comma delimited list."
                    v-model="localWatcher.extensions"
                    @change="onExtensions"
                />
                <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
            </validation-provider>
        </label>
        
        <button class="topcoat-button--large--quiet" type="button"
            @click.prevent="onDelete"
        >X</button>
    </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";

import _ from "../utils";
import AFolderDialogButton from "./a-folder-dialog-button.vue";
import ACheckbox from "./a-checkbox.vue";

export default {
    name: "AWatcher",
    components: {
        ValidationProvider,
        AFolderDialogButton,
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
        validateName(value)
        {
            const name = value.trim();
            this.localWatcher.name = name;
            const found = this.watchers.filter(w => w.name == name).length;
            return {
                valid: found === 1, 
                message: "Name must be unique"
            };
        },
        validateExtensions(value) 
        {
            // TODO: Implement better validation
            let extensions = value.split(','); 
                extensions = extensions.map(ext => ext.replace(/[^a-z0-9]/g, ''));
                extensions = extensions.filter(ext => ext && ext.length > 0);
            if(extensions.includes("json")) {
                return ["json"];
            }
            return extensions;
        },
        onExtensions(event)
        {
            const value = event.target.value;
            this.localWatcher.extensions = this.validateExtensions(value);
        },
        onDelete(event)
        {
            this.$emit("delete", this.localWatcher.id);
        }
    }
}
</script>
