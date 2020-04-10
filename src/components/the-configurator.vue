<template>
    <form id="configuration-form"
        @submit="onConfigurationSubmit"
        novalidate="true"
    >
        <h2>Watchers</h2>
        <watcher class="watcher" 
            v-for="(watcher, index) in configuration.watchers" 
            :key="watcher.id"
            v-model="configuration.watchers[index]"
            @changed="markForSave"
            @delete="onDeleteWatcher(watcher.id)"
        >
        </watcher>
        <div class="controls">            
            <button class="topcoat-button--large" type="button" @click="onAddNewWatcher">Add Watcher</button>
        </div>
        <label>
            <input class="topcoat-text-input" type="text" placeholder="/my/custom/jsx/actions" 
                title="The path to the directory containing custom extendscript actions"
                v-model="configuration.pathToUserActions"
                @change="markForSave"
            />
        </label>
        <div class="controls">
            <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
        </div>
    </form>
</template>

<script>
import _ from "../utils";
import watcher from "./watcher.vue";

/**
 * General Application Configuration
 */
export default {
    name: "TheConfigurator",
    components: {
        watcher
    },
    // TODO: shouldnt accept props, since its specific to the app, and not the context within the app
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
            this.$emit('changed', this.configuration);
            this.needSaved = false;
        }

        // TODO Implement Import/Export Configuration
    }
}
</script>

<style scoped>

</style>