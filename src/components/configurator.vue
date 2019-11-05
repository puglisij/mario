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
            <input class="topcoat-text-input" type="text" placeholder="jpg, jpeg, png" 
                v-model="watcher.extensions"
                @change="markForSave" 
            />
            <button class="watcher-delete topcoat-icon-button--quiet" 
                @click="onDeleteWatcher($event, watcher.id);"
            >X</button>
        </div>
        <button class="topcoat-button--large" v-if="needSaved">Save</button>
        <button class="topcoat-button--large" @click="onAddNewWatcher">Add</button>
    </form>
</template>

<script>
import checkbox from "./checkbox.vue";
import _ from "../utils";

export default {
    name: "configurator",
    components: {
        checkbox
    },
    props: {
        configuration: Object
    }, 
    data: () => ({
        needSaved: false
    }),
    methods: {
        markForSave: function(el) {
            this.needSaved = true;
            console.log("Watcher configuration changed.");
        },
        onAddNewWatcher(event)
        {
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
            const watchers = this.configuration.watchers.filter(w => w.id != id);
            this.configuration.watchers = watchers;
            this.markForSave();
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
        border-bottom: 1px solid #333;
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