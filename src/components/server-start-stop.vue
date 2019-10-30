<template>
    <div class="start-stop-buttons">
        <button class="topcoat-button--large" v-on:click="startPause">{{ isPaused || isStopped ? 'Start' : 'Pause' }}</button>
        <button class="topcoat-button--large" v-on:click="stop">Stop</button>
    </div>
</template>

<script>
export default {
    name: 'server-start-stop',
    props: {
        isPaused: Boolean,
        isStopped: Boolean
    },
    methods: {
        startPause() {
            this.$emit(this.isPaused || this.isStopped ? 'start' : 'pause');
        },
        stop() {
            this.$emit('stop');
        }
    }
}
</script>

<style scoped>

</style>