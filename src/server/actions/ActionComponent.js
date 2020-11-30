import { Component, Input, Output } from 'rete';
import { InputControl } from '@/rete/controls/input/index';
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
        // TODO: Check which parameters are nested object params. Dont create root object as input.
        for (let i = 0; i < actionDescriptor.parameters.length; ++i) 
        {
            const parameter = actionDescriptor.parameters[i];
            const inputControl = new InputControl(
                this.editor,
                parameter.name,
                parameter.typeNames,
                parameter.defaultValue,
                parameter.isRequired
            );
            const input = new Input(
                parameter.name,
                parameter.name,
                Socket.input,
                false // multiple connections
            );
            input.addControl(inputControl);
            node.addInput(input);
        }

        var inExec = new Input(
            'act',
            Socket.input.name, 
            Socket.input
        );
        node.addInput(inExec);
        var outThen = new Output(
            'then',
            Socket.output.name,
            Socket.output // TODO: Use Socket per the return type
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
