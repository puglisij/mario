<template>
    <div class="start-stop-buttons">
        <button v-on:click="startPause">{{ isRunning ? 'Pause' : 'Start' }}</button>
        <button v-on:click="stop">Stop</button>
    </div>
</template>

<script>
export default {
    name: 'server-start-stop',
    props: {
        isRunning: Boolean
    },
    methods: {
        startPause() {
            this.$emit(this.isRunning ? 'pause' : 'start');
        },
        stop() {
            this.$emit('stop');
        }
    }
}
</script>

<style scoped>

</style>