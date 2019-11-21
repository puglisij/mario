<template>
    <div class="watcher">
        <label>
            <input class="topcoat-text-input" type="text" placeholder="/my/watch/folder" 
                title="The path to the folder to watch for new json, or image types for processing, given below."
                v-model="localWatcher.path"
                @change="emitChange"
            />
        </label>
        <label>
            <input class="topcoat-text-input" type="text" placeholder="jpg, jpeg, png, psd, tif, etc." 
                title="Either multiple image extensions, or json (exclusive)."
                v-model="localWatcher.extensions"
                @change="onExtensions" 
            />
        </label>
        <label>
            <input class="topcoat-text-input" type="text" placeholder="the default pipeline type (e.g. product)" 
                title="The default type if no json data is made available for a new image process."
                v-model="localWatcher.defaultType"
                @change="emitChange" 
            />
        </label>
        <button class="watcher-delete topcoat-icon-button--quiet" type="button"
            @click="onDelete"
        >X</button>
    </div>
</template>

<script>
import _ from "../utils";
import checkbox from "./checkbox.vue";

export default {
    name: "watcher",
    components: {
        checkbox
    },
    model: {
        prop: "watcher", 
        event: "changed"
    },
    props: {
        watcher: Object
    }, 
    data() {
        return {
            localWatcher: this.toLocalWatcher(this.watcher)
        }
    },
    methods: {
        toLocalWatcher(watcher)
        {
            return _.simpleDeepClone(watcher);;
        }, 
        emitChange()
        {
            this.$emit("changed", this.localWatcher);
        },
        validateExtensions(value) 
        {
            // extensions must be an array
            let extensions = value.split(','); 
                extensions = extensions.map(ext => ext.replace(/[^a-z0-9]/g, ''));
                extensions = extensions.filter(ext => ext && ext.length > 0);
            if(extensions.includes("json")) {
                return ["json"];
            }
            return extensions;
        },
        hasExtension(extension)
        {
            return this.localWatcher.extensions.includes(extension);
        },
        onExtensions(event)
        {
            let value = event.target.value;
            this.localWatcher.extensions = this.validateExtensions(value);
            this.emitChange();
        },
        onDelete(event)
        {
            this.$emit("delete");
        },
    }
}
</script>

<style scoped>
    .watcher {
        border: none;
        border-bottom: 1px solid #333;
        padding: .5em;
    }
    .watcher:last-of-type {
        margin-bottom: .5em;
    }
    .watcher-delete {
        float: right;
    }
    label {
        display: inline-block;
        margin: .25em 0;
        width: 90%;
    }
    input[type=text] {
        width: 100%;
    }
</style>