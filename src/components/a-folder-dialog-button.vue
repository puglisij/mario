<template>
    <span class="topcoat-button" @click="onClick">&#128447;</span>
</template>

<script>
import host from '../host';

export default {
    name: "AFolderDialogButton",
    // NOTE: Using prop instead of v-model to avoid issues with Vee-Validation (since it looks for first v-model in its tree)
    props: {
        folder: {
            type: String, 
            required: true
        }
    },
    methods: {
        onClick(e) 
        {
            host.runActionWithParameters("action.selectFolder", this.folder)
            .then(result => {
                if(result.toLowerCase().includes("error")) {
                    console.error(result);
                    return;
                }
                this.$emit("update:folder", result == "null" ? this.folder : result);
            });
        }
    }
}
</script>

<style scoped>

</style>