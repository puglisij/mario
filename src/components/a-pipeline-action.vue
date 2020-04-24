<template>
    <div class="action">
        <span class="action-handle"
            title="Drag to re-order">&#9776;</span>
        <span class="action-expand" 
            :class="{show: showParameters}" 
            :title="(showParameters ? 'Hide' : 'Show') + ' Parameters'"
            @click="toggleParameters"><i>&#128065;</i></span>
        <!-- data --> 
        <div class="action-data">
            <!-- name -->
            <div class="action-name">
                <input class="topcoat-text-input" type="text" placeholder="the action string (e.g. 'action.saveDocument')"
                    title="The action function name as given in the jsx. Case sensitive."
                    :value="localAction.action"
                    @change="onActionName"
                />
                <button class="action-select topcoat-icon-button--quiet" 
                    type="button" 
                    title="Select an existing action"
                    @click="onActionSelectNew">&#128447;</button>
                <button class="action-delete topcoat-icon-button--quiet" 
                    type="button" 
                    title="Delete this action"
                    @click="onActionDelete">X</button>
            </div>
            <!-- parameters -->
            <div class="action-parameters" v-if="showParameters">
                <h3>Parameters</h3>
                <pipeline-action-parameter
                    v-for="(parameter, parameterId) in localAction.parameters" 
                    :key="parameterId"
                    :id="parameterId"
                    :name="parameter.name"
                    :value="parameter.value"
                    :disableName="hasSingleParameter"
                    @changed="onParameterChanged"
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
import APipelineActionParameter from "./a-pipeline-action-parameter.vue";
import _ from "../utils";

const SINGLE_NONAME_PARAMETER = "SINGLE";

export default {
    name: "APipelineAction",
    components: {
        APipelineActionParameter
    },
    model: {
        prop: "action", 
        event: "changed"
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
            let rawAction = {
                action: localAction.action
            };
            if(this.hasParameters) {
                if(this.hasSingleParameter) {
                    rawAction.parameters = _.first(localAction.parameters).value;
                }
                else 
                {
                    rawAction.parameters = {};
                    for(const [parameterId, parameter] of Object.entries(localAction.parameters)) {
                        rawAction.parameters[parameter.name] = parameter.value;
                    }
                }
            }
            return Object.assign({}, this.action, rawAction);
        },
        /** 
            Local Action Example: 
            {
                "id-0": {
                    "name": "colorSpace"
                    "value": "RGB"
                }
            }
        */
        toLocalAction(rawAction) 
        {
            const localAction = {
                action: rawAction.action, 
                parameters: {}
            };
            let rawParameters = {};
            if(_.isObject(rawAction.parameters)) {
                rawParameters = rawAction.parameters;
            } else if (_.isBoolean(rawAction.parameters) 
                    || _.isNumber(rawAction.parameters) 
                    || _.isString(rawAction.parameters)
                    || _.isNull(rawAction.parameters)) {
                rawParameters = {
                    [SINGLE_NONAME_PARAMETER]: rawAction.parameters
                };
            } 
            for(const [parameterName, parameterValue] of Object.entries(rawParameters)) {
                const parameterId = _.guid();
                localAction.parameters[parameterId] = {
                    name: parameterName, 
                    value: parameterValue
                };
            }
            return localAction;
        },
        emitChange()
        {
            const rawAction = this.toRawAction(this.localAction);
            this.$emit("changed", rawAction);
        },
        onActionName(event)
        {
            this.localAction.action = event.target.value;
            this.emitChange();
        },
        onActionSelectNew(event) {
            this.$emit("select-new");
        },
        onActionDelete(index) {
           this.$emit("delete");
        },
        toggleParameters() {
            this.showParameters = !this.showParameters;
        }, 
        onParameterAddSingle(event)
        {
            const parameterId = _.guid();
            this.$set(this.localAction.parameters, parameterId, {
                name: SINGLE_NONAME_PARAMETER, 
                value: ""
            });
            this.emitChange();
        },
        onParameterAddMultiple(event) 
        {
            const parameterId = _.guid();
            this.$set(this.localAction.parameters, parameterId, {
                name: "name", 
                value: ""
            });
            this.emitChange();
        },
        onParameterChanged(id, name, value) 
        {
            this.localAction.parameters[id].name = name;
            this.localAction.parameters[id].value = value;

            this.emitChange();
        }, 
        onParameterDelete(id) {
            this.$delete(this.localAction.parameters, id);

            this.emitChange();
        } 
    }
}
</script>

<style lang="scss">
    /*
        -----------------------------------------------
        | Handle | Expand | Data                      |
        |        |        | Name (Name | Select | X)  |
        |        |        | Parameters                |
        _______________________________________________
    */
    .action {
        align-items: flex-start;
        border-bottom: 1px solid #333;
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        padding: .25em;
        width: 100%;

        &:last-of-type {
            margin-bottom: .5em;
        }
    }


    .action-handle {
        cursor: row-resize;
        margin: 0 .5em 0 0;
    }
    .action-expand {
        cursor: pointer;
        height: 100%;
        margin: 0 .5em 0 0;
        width: 20px;

        i {
            opacity: .2;
        }
        &.show i {
            opacity: 1
        }
    }

    .action-data {
        flex-grow: 1;

        .action-name, 
        .action-parameters {
            display: flex;
            width: 100%;
        }
        .action-name {
            input[type=text] {
                flex-grow: 1;
            }
            .action-delete {
                margin: 0 0 0 .5em;
            }
        }
        .action-parameters {
            flex-direction: column;
            margin: .25em 0 0 0;

            h3 {
                margin: .25em 0;
            }
        }
        .action-parameter {
            display: block;
            letter-spacing: -1em;
            margin: 0 0 .25em 0;

            select,
            input, 
            label, 
            button {
                display: inline-block;
            }
            select, 
            button {
                width: 10%;
            }
            &__input {
                margin: 0 1%;
                width: 38%;
            }
        }
    }
</style>