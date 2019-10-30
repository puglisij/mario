<template>
    <div>
        <label class="topcoat-checkbox">
            <input type="checkbox" v-bind:name="name" v-bind:checked="checked">
            <div class="topcoat-checkbox__checkmark"></div>
            <slot/>
        </label>
    </div>
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
        name: String
    }
}
</script>

<style scoped>

</style>