<template>
    <div class="controls">
        <button class="topcoat-button--large" 
            :title="primaryButtonTitle"
            @click="startPause"
            v-html="primaryButtonLabel"></button>
        <button class="topcoat-button--large" 
            title="Stop all pipelines."
            v-show="!isStopped" 
            @click="stop"
            >&#9724;</button>
    </div>
</template>

<script>
export default {
    name: 'StartStop',
    props: {
        isPaused: {
            type: Boolean, 
            default: false
        },
        isStopped: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        primaryButtonLabel() {
            if(this.isPaused) {
                return "Resume";
            } 
            if(this.isStopped) {
                return "&#9654;";
            }
            return "&#10074;&#10074;";
        },
        primaryButtonTitle() {
            if(this.isPaused) {
                return "Resume all pipelines.";
            }
            if(this.isStopped) {
                return "Play all pipelines.";
            }
            return "Pause all pipelines.";
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