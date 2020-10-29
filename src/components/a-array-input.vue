<template>
    <input type="text" 
        :value="valueString" 
        @input.prevent
        @change.prevent="onValueChange" 
    />
</template>

<script>
// TODO Make this a full blow label wrapper like a-folder-input
export default {
    name: "AArrayInput",
    model: {
        prop: "value",
        event: "change"
    },
    props: {
        value: {
            type: Array, 
            required: true
        },
        removeEmpty: {
            type: Boolean,
            required: false, 
            default: true
        }
    },
    computed: {
        valueString() {
            return this.value ? this.value.join(", ") : "";
        }
    }, 
    methods: {
        emitNewArray(newValue) {
            // Remove whitespace
            let newArray = newValue.split(",").map(v => v.trim());
            if(this.removeEmpty) {
                newArray = newArray.filter(v => !!v);
            }
            this.$emit("change", newArray);
        },
        onValueChange(e) {
            this.emitNewArray(event.target.value);
        }
    }
}
</script>