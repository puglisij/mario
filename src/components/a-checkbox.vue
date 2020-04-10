<template>
    <label class="topcoat-checkbox">
        <input type="checkbox" :name="name" :value="value" :checked="localChecked" @change="onCheckbox">
        <div class="topcoat-checkbox__checkmark"></div>
        <slot/>
    </label>
</template>

<script>
export default {
    name: "ACheckbox",
    model: {
        prop: "checked",
        event: "change"
    },
    props: {
        checked: null,
        value: String,
        name: String
    }, 
    computed: {
        localChecked() {
            return !!this.checked;
        }
    },
    methods: {
        onCheckbox(event) {
            this.$emit("change", event.target.checked, event.target.name);
        }
    }
}
</script>

<style scoped>
    label {
        display: block;
        margin: 5px 0;
    }
</style>