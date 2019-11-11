<template>
    <div class="action-parameter">
        <select 
            v-model="type"
            @change="onType">
            <option v-for="(type, typeName) in types" :key="typeName" :value="typeName">{{ typeName }}</option>
        </select> 
        <input class="action-parameter__input topcoat-text-input" type="text" placeholder="value"
            v-model="localName"
            @change="onName"
            :disabled="disableName"
        />
        <checkbox class="action-parameter__input" name="check" 
            v-show="isBoolean"
            v-model="localValue" 
            @change="onValue"
            />
        <input class="action-parameter__input topcoat-text-input" type="text" name="text" 
            placeholder="value"
            v-show="!isBoolean"
            v-model="localValue"
            @change="onValue"
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
const TYPE_AUTO = "Auto";

const TYPES_ = {
    [typeof("")]: TYPE_STRING, 
    [typeof(0)]: TYPE_NUMBER, 
    [typeof(true)]: TYPE_BOOLEAN, 
    [typeof(null)]: TYPE_AUTO
};
const TYPES = {
    [TYPE_STRING]: typeof(""),
    [TYPE_NUMBER]: typeof(0),
    [TYPE_BOOLEAN]: typeof(true),
    [TYPE_AUTO]: typeof(null)
}

// parent will bind model to value only, all other data is used locally
export default {
    name: 'pipeline-action-parameter',
    components: {
        checkbox
    },
    data() {
        const conversion = this.convertTypeAuto(this.value);
        return {
            type: conversion.type, 
            typeSetByUser: conversion.value !== null,
            localValue: conversion.value,
            localName: this.name
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
        isBoolean: function() { return this.type === TYPE_BOOLEAN; }, 
        isNumber: function() { return this.type === TYPE_NUMBER; },
        isString: function() { return this.type === TYPE_STRING; },
        isAuto: function() { return this.type === TYPE_AUTO; }
    },
    methods: {
        convertTypeAuto(value, forceType)
        {
            if(_.isNumber(value) || (value !== null && !isNaN(value))) {
                return {
                    type: TYPE_NUMBER,
                    value: Number(value)
                };
            } else if(_.isBool(value)
                || (_.isString(value) && (value.toLowerCase() === "true" || value.toLowerCase() === "false"))) {
                return {
                    type: TYPE_BOOLEAN,
                    value: JSON.parse(value.toLowerCase())
                };
            } else if(_.isString(value)) {
                return {
                    type: TYPE_STRING,
                    value
                };
            }

            return {
                type: TYPE_AUTO,
                value: null
            };
        },  
        onValue()
        {
            let conversion = this.convertTypeAuto(this.localValue);
            if(this.typeSetByUser) {
                this.localValue = conversion.type === this.type ? conversion.value : null;
            } else {
                this.type = conversion.type;
                this.localValue = conversion.value;
            }
            console.log("parameter onValue");
            this.$emit('changed', this.id, this.localName, this.localValue);
        },
        onName(event) 
        {
            console.log("parameter onName");
            this.$emit('changed', this.id, this.localName, this.localValue);
        },
        onType(event)
        {
            // TODO Convert value as appropriate
            if(this.isBoolean) {
                this.localValue = this.$el.querySelector("input[name=check]").checked;
            } else {
                this.localValue = this.$el.querySelector("input[name=text]").value;
            }
            this.onValue();
        },
        onDelete(event) {
            this.$emit('delete', this.id);
        }
    }
}
</script>

<style scoped lang="scss">

</style>