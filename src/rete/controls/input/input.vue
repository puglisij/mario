<template>
    <!-- <label>
        {{ikey}}
        <input
            type="text"
            :required="required"
            :value="value"
            @input.stop="onChange($event)"
            @mousedown.stop
        />
    </label> -->
    <component :is="control"></component>
</template>

<script>

/**
 * Render Rete control for a JSX action node function parameter
 * The following methods are available to each instance of Control
 * and passed as props to its vue component.
 *  getData('key')
 *  putData('key', value)
 */
export default { 
    props: [
        'ikey', 
        'types', 
        'initial', 
        'required', 
        'getData', 
        'putData'
    ],
    data() {
        return {
            value: this.initial || 0,
        }
    },
    computed: {
        control() {
            return () => import(`@/rete/controls/input/${types[0]}.vue`);
        }
    },
    methods: {
        parse(value) {
            return this.types.includes('number') ? +value : value;
        },
        onChange(e){
            this.value = this.parse(e.target.value);
            this.update();
        },
        update() {
            if (this.ikey) {
                this.putData(this.ikey, this.value)
            }
        }
    },
    created() {
        // TODO: Determine appropriate display per [types] prop
        // TODO: Need to map [type] -> [component.vue]
        // TODO: Deemphasize parameter/control if its optional
        // ALGORITHM: 
        //  If types.length > 1 
        //      If types contains primitive type 
        //          display primitive control
        //  If type is enum
        //      display select
        //  If type is function
        //      display text input for function name?
        //  If not recognized
        //      display custom jsx input?
        /* 
            Example types
            --------------
            BitsPerChannelType,     // (enum) <select>
            BlendMode,              // (enum) <select>
            Document,               // (class) no control
            DocumentFill,           // (enum) <select>
            DropShadowBlendMode,    // (enum) <select>
            DropShadowContour,      // (enum) <select>
            File,                   // (class) <input type=text>
            LayerIconColor,         // (enum) <select>
            NewDocumentMode,        // (enum) <select>
            ResampleMethod,         // (enum) <select>
            SubPathItem,            // (class) no control
            UnitValue,              // (class) <input type=text> or <input type=number> + <select>
            XResampleMethod,        // (enum) <select>
            openEachImageCallback,  // (function) no control? (or allow function name as string?)
            function                // (function) no control? (or allow function name as string?)
            bool,                   // <input type=checkbox>
            boolean,                // <input type=checkbox>
            number,                 // <input type=number> or <slider>
            object,                 // (object) if plain object, render as property map with +/- buttons
            string                  // <input type=text> or <textarea>
            <type>[]                // (array) repeat component for <type> and display +/- buttons
        */
        

        //this.putData(this.ikey, this.value);
    },
    mounted() {
        const val = this.getData(this.ikey);
        this.value = typeof val !== 'undefined' ? val : this.value;
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
