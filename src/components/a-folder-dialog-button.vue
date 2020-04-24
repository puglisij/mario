<template>
    <button class="topcoat-button" @click="onClick">&#128447;</button>
</template>

<script>
import host from '../host';

export default {
    name: "AFolderDialogButton",
    methods: {
        onClick(e) {
            host.runActionWithParameters("action.selectFolder", this.value)
            .then(result => {
                if(result.toLowerCase().includes("error"))
                    console.error(result);

                this.$emit("change", result);
            });
        }
    }
}
</script>

<style scoped>
    button {
        padding: 0 1rem;
    }
</style>