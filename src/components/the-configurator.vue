<template>
    <validation-observer 
        ref="observer"
        slim
        v-slot="{ handleSubmit }"
    >
        <form 
            class="configurator"
            novalidate="true"
            @keydown.enter.prevent
            @submit.prevent="handleSubmit(onConfigurationSubmit)"
        >
            <h2 class="tab-title">Configuration<i v-show="needSaved">*</i></h2>
            <section class="section-content">
                <label>
                    <div class="label">Custom Actions Folder</div>
                    <validation-provider 
                        class="flex"
                        tag="div"
                        rules="pathunc:false|pathexists" 
                        v-slot="v"
                    >
                        <a-folder-dialog-button :folder.sync="pathToUserActions" @update:folder="onPathToUserActions"></a-folder-dialog-button>
                        <input 
                            class="topcoat-text-input flex-grow ml1" 
                            type="text" 
                            placeholder="/my/custom/jsx/actions" 
                            title="The path to the directory containing custom extendscript actions"
                            v-model="pathToUserActions"
                            @change="onPathToUserActions"
                        />
                        <span class="topcoat-notification error" v-if="v.errors.length">{{ v.errors[0] }}</span>
                    </validation-provider>
                </label>
                <div class="configurator-buttons">
                    <button 
                        class="topcoat-button--large"
                        type="button"
                        @click.prevent="onReloadActions"
                        v-show="!isLoadingActions"
                    >Reload Actions</button>
                    <wait-dots v-show="isLoadingActions" />
                </div>
            </section>
            <h3 class="section-title">File Watchers</h3>
            <section class="section-content">
                <a-watcher
                    v-for="(watcher, index) in fileWatchers"
                    :key="watcher.id"
                    :watchers="fileWatchers"
                    v-model="fileWatchers[index]"
                    @changed="onWatcherChange"
                    @delete="onDeleteWatcher"
                ></a-watcher>
            </section>
            <div class="configurator-buttons">
                <button 
                    class="topcoat-button--large" 
                    type="button"
                    @click.prevent="onAddNewWatcher"
                >Add File Watcher</button>
                <button 
                    class="topcoat-button--large"
                    type="submit" 
                    v-show="needSaved" 
                    ref="save"
                >Save</button>
            </div>
        </form>
    </validation-observer>
</template>

<script>
import { ValidationProvider, ValidationObserver } from "vee-validate";

import _ from "../utils";
import store from "../store"; 
import AFolderDialogButton from "./a-folder-dialog-button.vue";
import ACheckbox from "./a-checkbox.vue";
import AWatcher from "./a-watcher.vue";
import WaitDots from './wait-dots.vue';
import Server from '../server';

/**
 * General Application Configuration
 */
export default {
    name: "TheConfigurator",
    components: {
        ValidationObserver,
        ValidationProvider,
        AFolderDialogButton,
        ACheckbox,
        AWatcher,
        WaitDots
    },
    data: () => {
        return {
            needSaved: false, 
            isLoadingActions: false,
            pathToUserActions: store.general.pathToUserActions,
            fileWatchers: _.simpleDeepClone(store.general.fileWatchers)
        }
    },
    methods: {
        markForSave: function(el) {
            this.needSaved = true;
        },
        async onReloadActions(event)
        {
            this.isLoadingActions = true;
            await Server.actions.init();
            this.isLoadingActions = false;
        },
        onPathToUserActions(event)
        {
            this.markForSave();
        },
        onWatcherChange(watcher)
        {
            this.markForSave();
        },
        onAddNewWatcher(event)
        { 
            let watcher = {
                id: _.guid(),
                name: "",
                path: "",
                useProcessedDirectory: true,
                processedDirectory: "",
                useOutputDirectory: true,
                outputDirectory: "",
                extensions: []
            };
            this.fileWatchers.push(watcher);
        },
        onDeleteWatcher(id)
        {
            this.$dialog.openConfirm({
                name: "confirm",
                message: "Delete this file watcher?",
                onYes: () => {
                    this.fileWatchers = this.fileWatchers.filter(w => w.id != id);
                    this.markForSave();
                }
            })
        },
        onConfigurationSubmit(event)
        {
            // TODO Ensure pipelines only refer to existing watchers?
            store.general.pathToUserActions = this.pathToUserActions;
            store.general.fileWatchers = this.fileWatchers;
            this.$emit('changed');
            this.needSaved = false;
        }
    }
}
</script>
