<template>
    <form id="watchers-form"
        @submit="onConfigurationSubmit"
        novalidate="true"
    >
        <h2>Watchers</h2>
        <div class="watcher" 
            v-for="watcher in configuration.watchers" 
            :key="watcher.id"
        >
            <input class="topcoat-text-input" type="text" placeholder="/my/watch/folder" 
                v-model="watcher.path"
                @change="markForSave"
            />
            <br/>
            <input class="topcoat-text-input" type="text" placeholder="jpg, jpeg, png, psd, tif, etc." 
                v-model="watcher.extensions"
                @change="onWatcherExtensions($event, watcher.id)" 
            />
            <br/>
            <input class="topcoat-text-input" type="text" placeholder="the default pipeline type (e.g. product)" 
                v-model="watcher.defaultType"
                @change="markForSave" 
            />
            <button class="watcher-delete topcoat-icon-button--quiet" type="button"
                @click="onDeleteWatcher($event, watcher.id);"
            >X</button>
        </div>
        <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
        <button class="topcoat-button--large" type="button" @click="onAddNewWatcher">Add Watcher</button>
    </form>
</template>

<script>
import _ from "../utils";

export default {
    name: "configurator",
    components: {
    },
    props: {
        configuration: Object
    }, 
    data: () => ({
        // TODO either persist this or store dirty flag in parent component
        needSaved: false
    }),
    methods: {
        markForSave: function(el) {
            this.needSaved = true;
            console.log("Watcher configuration changed.");
        },
        getWatcher: function(id) {
            return this.configuration.watchers.find(w => w.id == id);
        },
        onWatcherExtensions(event, id)
        {
            let value = event.target.value;
            let watcher = this.getWatcher(id);
            // extensions is an array
            watcher.extensions = value.replace(/[^a-z0-9,]/g, '').split(',').filter(ext => ext && ext.length > 0);
            this.markForSave();
        },
        onAddNewWatcher(event)
        { 
            event.preventDefault();
            let watcher = {
                id: _.guid(),
                path: "",
                extensions: ""
            };
            this.configuration.watchers.push(watcher);
            this.markForSave();
        },
        onDeleteWatcher(event, id)
        {
            event.preventDefault();
            this.$dialog.open({
                name: "confirm",
                onYes: () => {
                    const watchers = this.configuration.watchers.filter(w => w.id != id);
                    this.configuration.watchers = watchers;
                    this.markForSave();
                }
            })
        },
        onConfigurationSubmit(event)
        {
            event.preventDefault();
            this.$emit('update:watchers', this.configuration.watchers);
            this.needSaved = false;
        }
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
    input[type=text] {
        display: inline-block;
        margin: .5em 0;
        width: 85%;
    }
</style>