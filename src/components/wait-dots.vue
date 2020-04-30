<template>
    <span v-html="dots"></span>
</template>

<script>
let handle = 0;

export default {
    name: "WaitDots", 
    props: {
        intervalMs: {
            type: Number,
            default: 500
        }
    },
    data() {
        return { 
            dotCount: 1,
            dots: "." 
        };
    },
    mounted() {
        handle = setInterval(() => {
            this.dots = ".".repeat(this.dotCount);
            this.dots += "&nbsp;".repeat(4 - this.dotCount);
            this.dotCount = (this.dotCount + 1) % 4;
        }, this.intervalMs);
    },
    beforeDestroy() {
        clearInterval(handle);
    }
}
</script>