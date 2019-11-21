<template>
    <div>
        <h2>Console</h2>
        <div class="console topcoat-textarea" ref="output" v-html="output">
        </div>
        <div class="controls">
            <button class="topcoat-button--large--quiet" v-show="output.length > 0" @click="onClear">Clear</button>
            <button class="topcoat-button--large--quiet" @click="onSetAutoScroll">Turn Auto Scroll {{doAutoScroll ? "Off" : "On" }}</button>
        </div>
    </div> 
</template>

<script>
import logger from "./logger";

export default {
    name: "the-console",
    data() {
        return {
            output: "",
            doAutoScroll: true
        }
    },
    created() 
    {
        logger.on("logs", this.onLogs);
    },
    /**
     * The <keep-alive> equivalent to mounted()
     */
    activated() {
        this.autoScroll();
    },
    mounted() {
        this.autoScroll();
    },
    methods: {
        autoScroll() 
        {
            if(this.doAutoScroll && this.$refs.output) {
                this.$refs.output.scrollTop = this.$refs.output.scrollHeight;
            }
        },
        onLogs(chunk) 
        {
            //this.output = this.output.substring(chunk.length) + chunk;
            this.output = logger.read();
            this.autoScroll();
        }, 
        onClear(event)
        {
            this.output = "";
            logger.clear();
        },
        onSetAutoScroll(event)
        {
            this.doAutoScroll = !this.doAutoScroll;
            this.autoScroll();
        }
    }
} 
</script>

<style lang="scss">
    .console {
        height: 400px;
        overflow: scroll;
        overflow-x: hidden;
        overflow-wrap: break-word;
        width: 100%;

        .warn {
            background: #322b03;
            color: #fcdca1;
        }
        .error {
            background: #270001;
            color: #f87c82;
        }
    }
</style>