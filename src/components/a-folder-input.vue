<template>
    <label>
        <div class="label"><slot/></div>
        <div class="flex">
            <a-folder-dialog-button :folder.sync="path"></a-folder-dialog-button>
            <input class="topcoat-text-input flex-grow ml1" 
                type="text" 
                :placeholder="placeholder" 
                :title="title"
                v-model="path"
            />
            <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
        </div>
    </label>
</template>

<script>
import AFolderDialogButton from "./a-folder-dialog-button.vue";

export default {
    name: "AFolderInput",
    components: {
        AFolderDialogButton
    },
    model: {
        prop: "value", 
        event: "change"
    },
    props: {
        title: {
            type: String,
            default: "Enter a folder path or select a folder"
        },
        placeholder: {
            type: String,
            default: "/my/folder" 
        }, 
        errors: {
            type: Array, 
            default: []
        },
        value: {
            type: String, 
            required: true
        }
    }, 
    data() {
        return {
            path: this.value
        }
    },
    watch: {
        path: function(v) {
            this.$emit("change", this.path);
        }
    }
}
</script>