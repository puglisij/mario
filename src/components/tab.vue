<template>
    <button :class="{ active: isActive }" @click.prevent.stop="onClick">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "Tab",
    props: {
      title: {
        type: String,
        required: true
      }
    },
    computed: {
        isActive() {
            return this.$parent.activeTab == this.title;
        }
    },
    methods: {
        onClick(e) {
            this.$parent.$emit("tab-click", this.title);
        }
    }
}
</script>