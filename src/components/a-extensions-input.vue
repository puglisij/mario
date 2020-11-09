<template>
    <label>
        <div class="label"><slot/></div>
        <div class="flex">
            <a-array-input class="topcoat-text-input flex-grow" 
                placeholder="jpg, jpeg, png, psd, tif, etc." 
                :title="title"
                :value="extensions"
                :removeEmpty="true"
                @change="onExtensions"
            />
            <span class="topcoat-notification error" v-if="errors.length">{{ errors[0] }}</span>
        </div>
    </label>
</template>

<script>
import AArrayInput from "./a-array-input.vue";

export default {
    name: "AExtensionsInput",
    components: {
        AArrayInput
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
        errors: {
            type: Array, 
            default: []
        },
        value: {
            type: Array, 
            required: true
        }
    },
    data() {
        return {
            extensions: this.value
        }
    }, 
    methods: {
        validateExtensions(extensions) 
        {
            // TODO: Implement better validation. Maybe support file globs? 
            extensions = extensions.map(ext => ext.replace(/[^a-z0-9]/g, ''));
            extensions = extensions.filter(ext => ext && ext.length > 0);
            if(extensions.includes("json")) {
                return ["json"];
            }
            return extensions;
        },
        onExtensions(extensions) {
            this.extensions = this.validateExtensions(extensions);
            this.$emit("change", this.extensions);
        }
    }
}
</script>