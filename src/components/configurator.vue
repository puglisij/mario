<template>
    <div id="configuration">
        <h2>Watchers</h2>
        <form id="watchers-form"
            @submit="onConfigurationSubmit"
            novalidate="true"
        >
            <watcher class="watcher" 
                v-for="(watcher, index) in configuration.watchers" :key="watcher.id"
                v-model="configuration.watchers[index]"
                @changed="markForSave"
                @delete="onDeleteWatcher(watcher.id)"
            >
            </watcher>
            <div class="controls">
                <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
                <button class="topcoat-button--large" type="button" @click="onAddNewWatcher">Add Watcher</button>
            </div>
        </form>

        <h2>Settings</h2> 
        <form id="settings-form">
            <input class="topcoat-text-input" 
                type="text" 
                placeholder="/path/to/jsx/actions" 
                title="The path to the folder to where .jsx Adobe action files are stored. These will be made available in the pipeline editor."
                v-model="configuration.pathToActions"
            />
            <p>
                Extendscript Action Nodes last built: MM/DD/YYYY @ 12:00AM
            </p> 
            <div class="controls">
                <button class="topcoat-button--large" type="button" @click="onRebuildActionNodes">Rebuild Action Nodes</button>
            </div>
        </form>
    </div>
</template>

<script>
import _ from "../utils";
import watcher from "./watcher.vue";


export default {
    name: "configurator",
    components: {
        watcher
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
        },
        getWatcher: function(id) {
            return this.configuration.watchers.find(w => w.id == id);
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
        onDeleteWatcher(id)
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
        },
        onRebuildActionNodes(event)
        {
            // Run JSX Rete Node Builder (via "event" for decoupling ?)
            // if success
            //      modal "Success"
            // else 
            //      modal "There was an issue... What do you want to do? Revert | Retry"
        }
    }
}
</script>

<style scoped>
    form {
        margin-left: 1em;
        margin-bottom: 20px;
    }
</style>