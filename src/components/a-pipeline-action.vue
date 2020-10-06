<template>
    <div class="action">
        <span class="action-handle"
            title="Drag to re-order">&#9776;</span>
        
        <div class="action-data">
            <div class="action-name">
                <input class="topcoat-text-input mr1" 
                    type="text" 
                    placeholder="the action function name (e.g. 'action.saveDocument')"
                    title="The action function name as given in the jsx. Case sensitive."
                    v-model="localAction.actionName"
                    readonly
                />
                <button class="topcoat-button--large--quiet" 
                    type="button" 
                    title="Delete this action"
                    @click="onActionDelete">X</button>
                <button class="topcoat-button--large--quiet expand ml1"
                    :class="{ open: showParameters }"
                    :title="(showParameters ? 'Hide' : 'Show') + ' Parameters'"
                    @click="toggleParameters"
                ><i>&#10097;</i></button>
            </div>

            <div class="action-parameters" v-if="showParameters">
                <h3>Parameters</h3>
                <a-pipeline-action-parameter
                    v-for="(parameter, parameterId) in localAction.parameters" 
                    :key="parameterId"
                    :id="parameterId"
                    :name="parameter.name"
                    :value="parameter.value"
                    :disableName="hasSingleParameter"
                    @change="onParameterChange"
                    @delete="onParameterDelete"
                />
                <button class="topcoat-button" type="button" 
                    title="Single parameters are passed as a single parameter, literal value, to the action function."
                    v-if="!hasParameters" 
                    @click="onParameterAddSingle"
                >
                    Add Single
                </button>
                <button class="topcoat-button" type="button" 
                    title="Multiple parameters are passed as an object of key value pairs to the action function."
                    v-if="!hasParameters || !hasSingleParameter" 
                    @click="onParameterAddMultiple"
                >
                    {{ hasParameters ? "Add" : "Add Multiple" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script> 
import _ from "../utils";
import APipelineActionParameter from "./a-pipeline-action-parameter.vue";

const SINGLE_NONAME_PARAMETER = "SINGLE";

export default {
    name: "APipelineAction",
    components: {
        APipelineActionParameter
    },
    model: {
        prop: "action", 
        event: "change"
    },
    props: {
        action: Object
    },
    data() {
        return {
            localAction: this.toLocalAction(this.action),
            showParameters: false
        }
    },
    computed: {
        hasParameters() {
            return Object.keys(this.localAction.parameters).length;
        }, 
        hasSingleParameter() {
            return Object.keys(this.localAction.parameters).length === 1
                    && _.first(this.localAction.parameters).name === SINGLE_NONAME_PARAMETER;
        }
    },
    methods: {
        emitChange() {
            const rawAction = this.toRawAction(this.localAction);
            this.$emit("change", rawAction);
        },
        /** 
            Local Action Example: 
            {
                action: "action.convertToColorProfile"
                parameters: {
                    "id-0": {
                        "name": "colorSpace"
                        "value": "RGB"
                    }
                }
            }
        */
        toLocalAction(rawAction) 
        {
            const { actionName, parameters } = rawAction;
            const rawParameters = (
                       _.isBoolean(parameters) 
                    || _.isNumber(parameters) 
                    || _.isString(parameters)
                    || _.isNull(parameters)) ? { [SINGLE_NONAME_PARAMETER]: parameters } : parameters;

            const localAction = {
                actionName, 
                parameters: {}
            };
            for(const [name, value] of Object.entries(rawParameters || {})) {
                const parameterId = _.guid();
                localAction.parameters[parameterId] = {
                    name, 
                    value
                };
            }
            return localAction;
        },
        /** 
            Raw Action Example:
            {
                "action": "action.convertToColorProfile",
                "parameters": "RGB"
            }
            Action parameters may be a single value or an object with key, value pairs. 
            Values may only be primitives String, Number, Boolean
        */
        toRawAction(localAction) 
        {
            const rawAction = {
                id: this.action.id,
                actionName: localAction.actionName
            };
            if(this.hasParameters) 
            {
                if(this.hasSingleParameter) {
                    rawAction.parameters = _.first(localAction.parameters).value;
                } else {
                    rawAction.parameters = {};
                    for(const [parameterId, parameter] of Object.entries(localAction.parameters)) {
                        rawAction.parameters[parameter.name] = parameter.value;
                    }
                }
            }
            return rawAction;
        },
        onActionDelete() {
           this.$emit("delete", this.action.id);
           this.emitChange();
        },
        toggleParameters() {
            this.showParameters = !this.showParameters;
        }, 
        onParameterChange(id, name, value) 
        {
            this.localAction.parameters[id].name = name;
            this.localAction.parameters[id].value = value;
            this.emitChange();
        },
        onParameterAddSingle()
        {
            const parameterId = _.guid();
            this.$set(this.localAction.parameters, parameterId, {
                name: SINGLE_NONAME_PARAMETER, 
                value: ""
            });
            this.emitChange();
        },
        onParameterAddMultiple() 
        {
            const parameterId = _.guid();
            this.$set(this.localAction.parameters, parameterId, {
                name: "name", 
                value: ""
            });
            this.emitChange();
        },
        onParameterDelete(id) {
            console.log("Deleting parameter: " + id);
            this.$delete(this.localAction.parameters, id);
            this.emitChange();
        } 
    }
}
</script>
