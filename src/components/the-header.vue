<template>
    <div>
        <start-stop 
            :isPaused="isServerPaused" 
            :isStopped="isServerStopped"
            @start="start" 
            @pause="pause" 
            @stop="stop"></start-stop>

        <a-checkbox name="pauseAfterEveryPipeline" v-model="pauseAfterEveryPipeline" @change="onConfigurationCheckbox">
            Pause after every pipeline
        </a-checkbox>
        <a-checkbox name="pauseAfterEveryAction" v-model="pauseAfterEveryAction" @change="onConfigurationCheckbox">
            Pause after every action
        </a-checkbox>
        <a-checkbox name="pauseAfterEveryImage" v-model="pauseAfterEveryImage" @change="onConfigurationCheckbox">
            Pause after each image
        </a-checkbox>
        <a-checkbox name="pauseOnExceptions" v-model="pauseOnExceptions" @change="onConfigurationCheckbox">
            Pause on Exceptions
        </a-checkbox>
    </div>
</template>

<script>
export default {
    name: "Header"
}
</script>