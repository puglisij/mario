import { Component, Input, Output } from 'rete';
import { InputControl } from '@/rete/controls/index';
import Socket from '@/rete/sockets';

export default class ActionComponent extends Component {
    constructor(actionDescriptor) {
        super(actionDescriptor.name);
        this.actionDescriptor = actionDescriptor;
    }
    /**
     * Rete node builder function for JSX Action Rete node
     * @param {import("rete").Node} node
     */
    builder(node) 
    {
        const actionDescriptor = this.actionDescriptor;
        // TODO: Create Sockets per parameter and return types
        //  ... or do we accept any input type?
        // TODO: Use separate outputs for return type and continue
        //       Or at least label the 'type' of the output
        //       and add a single non-parameter input to execute node
        // TODO: Support 'input' ONLY nodes? (they'd only have an output)
        // TODO: Support Extendscript Node for manually entering JSX code
        // TODO: Can sometimes get object instances constructor function name by  foo.constructor.name
        // or by checking reflect.name

        // TODO: How to determine if type is a data class or parameter object?
        // TODO: Check which parameters are nested object params. Dont create root objects as input.
        // NOTE: that the root object may be a custom defined @typedef
        // NOTE: Only view logic should be here
        for (let i = 0; i < actionDescriptor.parameters.length; ++i) 
        {
            const parameter = actionDescriptor.parameters[i];
            
            const input = new Input(
                parameter.name,
                parameter.name,
                Socket.input,
                false // multiple connections
            );
            if(parameter.canUseControl) 
            {
                const inputControl = new InputControl(
                    this.editor,
                    parameter.name,
                    parameter.typeNames,
                    parameter.defaultValue,
                    parameter.isRequired
                );
                input.addControl(inputControl);
            }

            node.addInput(input);
        }
        // TODO: What if there are no input parameters?
        var inExec = new Input(
            'act',
            Socket.input.name, 
            Socket.input
        );
        node.addInput(inExec);
        // TODO: Use Socket per the return type
        var outReturn = new Output(
            'return',
            Socket.return.name,
            Socket.return, 
            false
        );
        node.addOutput(outReturn);
        // TODO: Style this socket differently
        var outThen = new Output(
            'then',
            Socket.output.name,
            Socket.output,
            false
        );
        node.addOutput(outThen);
    }
    /**
     * Engine worker function for JSX action Rete node
     * Passes inputs to execution of JSX action
     * @param {import("rete").Node} node
     * @param {import("rete").Input} inputs
     * @param {object} outputs
     * @param {function} runAction
     * @returns {Promise}
     */
    worker(node, inputs, outputs, runAction) {
        for (const [key, inputValues] of Object.entries(inputs)) {
            node.data[key] = inputValues[0] || node.data[key];
        }

        return runAction(node.name, node.data).then(result => {
            outputs['then'] = result;
        });
    }
}
