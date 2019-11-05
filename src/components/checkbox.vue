<template>
    <label class="topcoat-checkbox">
        <input type="checkbox" :name="name" :value="value" :checked="checked" @change="onChange">
        <div class="topcoat-checkbox__checkmark"></div>
        <slot/>
    </label>
</template>

<script>
export default {
    name: "checkbox",
    model: {
        prop: "checked",
        event: "change"
    },
    props: {
        checked: Boolean,
        value: String,
        name: String
    }, 
    methods: {
        onChange(event) {
            console.log(`checkbox ${event.target.name} changed to ${event.target.checked}`);
            this.$emit("change", event.target.name, event.target.checked);
        }
    }
}
</script>

<style scoped>
    label {
        display: block;
        margin: 10px 0;
    }
</style>