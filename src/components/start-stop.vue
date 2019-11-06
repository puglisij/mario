<template>
    <div class="start-stop-buttons">
        <button class="topcoat-button--large" v-on:click="startPause">
            {{ primaryButtonLabel }}
        </button>
        <button class="topcoat-button--large" v-show="!isStopped" v-on:click="stop">Stop</button>
    </div>
</template>

<script>
export default {
    name: 'start-stop',
    props: {
        isPaused: Boolean,
        isStopped: Boolean
    },
    computed: {
        primaryButtonLabel() {
            if(this.isPaused) {
                return "Resume";
            } 
            if(this.isStopped) {
                return "Start";
            }
            return "Pause";
        }
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