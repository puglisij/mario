<template>
    <div>
        <h2>Console</h2>
        <textarea 
            class="topcoat-textarea" 
            style="box-shadow: none; border: none;"
            v-model="output" 
            rows="14" 
            cols="45" 
            v-on:focus.prevent
            readonly></textarea>
    </div> 
</template>

<script>
//import logger from "../server/console";

export default {
    name: "the-console",
    data: () => ({
        output: ""
    }),
    created() 
    {
        // const readStream = consoleManager.getReadStream();
        // readStream.on("data", this.onOut);
        // readStream.on("end", function() {
        //     console.log("no more to read from logs");
        // });
        
        //this.output = consoleManager.read();
    },
    beforeDestroy() 
    {

    },
    methods: {
        // readStream(stream) 
        // {
        //     let chunk;
        //     while(null !== (chunk = stream.read())) {
        //         output += chunk;
        //     }
        // },
        onOut(data) {
            this.output += data.toString();
        }, 
        onError(data) {
            this.output += data.toString();
        }
    }
}
</script>

<style scoped>

</style>