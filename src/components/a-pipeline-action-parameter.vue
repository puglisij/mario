<template>
    <div class="action-parameter">
        <select class="topcoat-text-input mr2" 
            v-model="type" 
            @change="onType"
        >
            <option v-for="typeName in types" :key="typeName" :value="typeName">{{ typeName }}</option>
        </select> 
        <div class="action-parameter__input mr2">
            <input class="topcoat-text-input" type="text" 
                placeholder="name"
                v-model="localName"
                :disabled="disableName"
            />
        </div>
        <a-checkbox class="action-parameter__input mr2"
            v-show="isBoolean"
            :checked="localValue"
            @change="onCheckboxValue" 
        />
        <div class="action-parameter__input mr2">
            <input class="topcoat-text-input" type="text" 
                placeholder="value"
                v-show="!isBoolean"
                :value="localValue"
                @change="onTextValue"
            />
        </div>
        <button class="topcoat-button--large--quiet" 
            type="button" 
            title="Delete this parameter"
            @click="onDelete">X</button>
    </div>
</template>

<script>
import _ from "../utils";
import ACheckbox from "./a-checkbox.vue";

const TYPE_STRING = "String";
const TYPE_NUMBER = "Number";
const TYPE_BOOLEAN = "Boolean";
const TYPE_NOT_SUPPORTED = "Unknown";
const TYPES = [
    TYPE_STRING, 
    TYPE_NUMBER,
    TYPE_BOOLEAN
];

export default { 
    name: 'APipelineActionParameter',
    components: {
        ACheckbox
    },
    props: {
        id: {
            type: String,
            required: true
        },
        disableName: Boolean, 
        name: String,
        value: null
    }, 
    data() {
        const type = this.getType(this.value);
        console.log(`parameter data() type: ${type} name: ${this.name} rawValue: ${this.value}`);

        return {
            type: type, 
            localValue: type === TYPE_NOT_SUPPORTED ? null : this.value,
            localName: this.name,
        }
    },
    computed: {
        types() {
            return TYPES;
        },
        isBoolean() { return this.type === TYPE_BOOLEAN; }, 
        isNumber() { return this.type === TYPE_NUMBER; },
        isString() { return this.type === TYPE_STRING; }
    },
    watch: {
        localName: function() { this.emitChange(); },
        localValue: function() { this.emitChange(); }
    },
    methods: {
        emitChange() {
            this.$emit("change", this.id, this.localName, this.localValue);
        },
        /**
         * Keep the original type
         */
        getType(value)
        {
            if(_.isBoolean(value)) {
                return TYPE_BOOLEAN;
            }
            if(_.isNumber(value)) {
                return TYPE_NUMBER;                   
            }
            if(_.isString(value)) {
                return TYPE_STRING;          
            }
            return TYPE_STRING;
        },
        forceType(value) 
        {
            if(this.isBoolean) {
                return Boolean(value);
            }
            if(this.isNumber) {
                return isNaN(value) ? 0 : Number(value);
            }
            if(this.isString) {
                return "" + value;
            }
        },
        onType()
        {
            this.localValue = this.forceType(this.localValue);
        },
        onCheckboxValue(isChecked) 
        {
            this.localValue = isChecked;
        },
        onTextValue()
        {
            this.localValue = this.forceType(event.target.value);
        },
        onDelete() {
            this.$emit('delete', this.id);
        }
    }
}
</script>
