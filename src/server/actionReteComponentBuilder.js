
/**
 * Function to be used with Rete ActionComponent for building nodes
 * @param {import("rete").Node} node 
 */
export function actionReteComponentBuilder(node)
{
    const actionDescriptor = actions.getActionDescriptorByName(this.name);

    for(let i = 0; i < actionDescriptor.parameters.length; ++i)
    {
        const inputControl = new InputControl(this.editor, 
            this.parameterCurator, 
            p.name, 
            p.typeNames, 
            false, 
            p.isRequired
        );
        const input = new Input(p.name, p.name, Socket.input, false);
              input.addControl(inputControl);
        node.addInput(input);
    }

    // TODO: Name output by action return type
    var outThen = new Output('then', "Then", Socket.action);
    node.addOutput(outThen)
}

/**
 * Function to be used with 
 * @param {import("rete").Node} node 
 * @param {import("rete").Input} inputs 
 * @param {*} outputs 
 * @param {*} runAction 
 */
export function actionReteComponentWorker(node, inputs, outputs, runAction)
{
    
    node.data.w = inputs.w[0] || node.data.w;
    node.data.h = inputs.h[0] || node.data.h;

    // runAction returns a Promise
    // result of Promise is assigned to outputData
    return runAction(node.name, node.data);
}