<template>
    <label>
        {{ikey}}
        <input
            :type="type || 'text'"
            :readonly="readonly"
            :required="required"
            :value="value"
            @input.stop="onChange($event)"
            @mousedown.stop
        />
    </label>
</template>

<script>
/**
 * Render Rete control for a JSX action node function parameter
 * NOTES:
 *      - Deemphasize parameter/control if its optional
 *      - Enum 'type' renders as a <select> dropdown
 */
export default {
    props: ['initial', 'readonly', 'required', 'emitter', 'ikey', 'type', 'change', 'getData', 'putData'],
    data() {
        return {
            value: this.initial || 0,
        }
    },
    methods: {
        parse(value) {
            return this.type === 'number' ? +value : value;
        },
        onChange(e){
            this.value = this.parse(e.target.value);
            this.update();
        },
        update() {
            if (this.ikey) {
                this.putData(this.ikey, this.value)
                this.change(this.value);
            }
            this.emitter.trigger('process');
        }
    },
    mounted() {

        const val = this.getData(this.ikey);
        this.value = typeof val !== 'undefined' ? val : this.value;

        this.putData(this.ikey, this.value);
    }
}
</script>


<style lang="scss" scoped>
    input {
        width: 100%;
        border-radius: 30px;
        background-color: white;
        padding: 2px 6px;
        border: 1px solid #999;
        font-size: 110%;
        width: 170px;
    }
</style>
