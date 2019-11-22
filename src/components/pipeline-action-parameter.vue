<template>
    <div class="action-parameter">
        <select v-model="type" @change="onType">
            <option v-for="typeName in types" :key="typeName" :value="typeName">{{ typeName }}</option>
        </select> 
        <input class="action-parameter__input topcoat-text-input" type="text" 
            placeholder="name"
            v-model="localName"
            @change="onName"
            :disabled="disableName"
        />
        <checkbox class="action-parameter__input" name="check" 
            v-show="isBoolean"
            :checked="localValue"
            @change="onCheckboxValue" 
        />
        <input class="action-parameter__input topcoat-text-input" type="text" name="text" 
            placeholder="value"
            v-show="!isBoolean"
            :value="localValue"
            @change="onTextValue"
        />
        <button class="topcoat-icon-button--quiet" 
            type="button" 
            title="Delete this parameter"
            @click="onDelete">X</button>
    </div>
</template>

<script>
import _ from "../utils";
import checkbox from "./checkbox.vue";

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
    name: 'pipeline-action-parameter',
    components: {
        checkbox
    },
    data() {
        const type = this.getType(this.value);
        console.log(`parameter data() type: ${type} rawValue: ${this.value}`);

        return {
            type: type, 
            localValue: type === TYPE_NOT_SUPPORTED ? null : this.value,
            localName: this.name,
        }
    },
    props: {
        id:  {
            type: String, 
            required: true
        },
        disableName: Boolean, 
        name: String, 
        value: null
    }, 
    computed: {
        types() {
            return TYPES;
        },
        isBoolean() { return this.type === TYPE_BOOLEAN; }, 
        isNumber() { return this.type === TYPE_NUMBER; },
        isString() { return this.type === TYPE_STRING; }
    },
    methods: {
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
        /**
         * Auto detect and convert the type
         */
        autoType(value)
        {
            if (_.isBoolean(value) || (_.isString(value) && (value.toLowerCase() === "true" || value.toLowerCase() === "false"))) {
                console.log("autoType() Boolean");
                return {
                    type: TYPE_BOOLEAN,
                    value: _.isString(value) ? JSON.parse(value.toLowerCase()) : value
                };
            } else if(_.isNumber(value) || !(value === "" || value === null || isNaN(value))) {
                console.log("autoType() Number");
                return {
                    type: TYPE_NUMBER,
                    value: Number(value)
                };
            } else {
                console.log("autoType() String");
                return {
                    type: TYPE_STRING,
                    value: _.isString(value) ? value : "" + value
                };
            }
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
        emitChange()
        {
            this.$emit('changed', this.id, this.localName, this.localValue);
        },
        onType(event)
        {
            this.localValue = this.forceType(this.localValue);
            this.emitChange();
        },
        onCheckboxValue(isChecked) 
        {
            this.localValue = isChecked;
            this.emitChange();
        },
        onTextValue(event)
        {
            this.localValue = this.forceType(event.target.value);
            this.emitChange();
        },
        onName(event) 
        {
            this.emitChange();
        },
        onDelete(event) {
            this.$emit('delete', this.id);
        }
    }
}
</script>

<style>

</style>