<template>
    <form id="watchers-form"
        @submit="onConfigurationSubmit"
        novalidate="true"
    >
        <h2>Watchers</h2>
        <watcher class="watcher" 
            v-for="(watcher, index) in configuration.watchers" :key="watcher.id"
            v-model="configuration.watchers[index]"
            @changed="markForSave"
            @delete="onDeleteWatcher(watcher.id)"
        >
        </watcher>
        <button class="topcoat-button--large" type="submit" v-show="needSaved">Save</button>
        <button class="topcoat-button--large" type="button" @click="onAddNewWatcher">Add Watcher</button>
    </form>
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
        }
    }
}
</script>

<style scoped>

</style>