import fs from 'fs';

/**
 * 
 * NOTE: The resulting .js files are NOT processed by Webpack and therefore are using older JS standard.
 * TODO: Could use a templating engine (e.g. Handlebars) here to make this more readable
 */
export class ActionDescriptorToReteComponentFileGenerator
{
    /**
     * Generates a Rete Component class for each action, and writes as a .js file to the appropriate directory
     * @param {ActionDescriptor[]} actionDescriptors 
     * @param {string} outputDirectory the absolute path to the output directory
     */
    generateReteComponents(actionDescriptors, outputDirectory)
    {
        for(let i = 0; i < actionDescriptors.length; ++i)
        {
            // generate file contents
            // stream file contents to disk 
        }
    }
    _generateReteComponentFileContents(actionDescriptor)
    {
        return this._templatize(
            actionDescriptor.name,
            this._templatizeConstructor(actionDescriptor),
            this._templatizeBuilder(actionDescriptor), 
            this._templatizeWorker(actionDescriptor)
        );
    }
    _templatize(actionName, templatizedConstructor, templatizedBuilder, templatizedWorker)
    {
        // First letter caps
        actionName = actionName[0].toUpperCase() + actionName.substring(1);

        return `
        import { Component, Input, Output } from 'rete';
        import Socket from '../sockets';
        import { InputControl } from '../controls/input/index';

        class ${actionName}Component extends Component 
        {
            ${templatizedConstructor}
            ${templatizedBuilder}
            ${templatizedWorker}
        }
        `;
    }
    _templatizeConstructor(actionDescriptor)
    {
        // TODO: Whenever this Component is loaded, pass to constructor an interface to JSX environment for making global Enum objects available as dropdown Control
        return `
        constructor(parameterCurator) {
            super("${actionDescriptor.name}");
            this.parameterCurator = parameterCurator;
        }`;
    }
    _templatizeBuilder(actionDescriptor)
    {
        // Rules for parameters given in JSDoc comment
        //  - dont use if it has no description
        //  - default to 'text' type if no type is given 
        //  - if parameter receives more than one type of primitive, default to type 'text'?  (e.g. Number|String)
        //  - accept any type? or... types 'string|number|boolean|enumerated object|array|object|File'
        
        // NOTE: parameters are also inputs (not just a Control) to allow programmable values (connection with outputs of other nodes)
        let inputDeclare = [];
        let inputAssign = [];
        for(let i = 0; i < actionDescriptor.parameters.length; ++i)
        {
            let p = actionDescriptor.parameters[i];
            if(!p.description.trim()) 
                continue;
            
            inputDeclare.push(
                `var input${p.name} = new Input(${p.name}, ${p.name}, Socket.input, false);`,
                `    input${p.name}.addControl(new InputControl(this.editor, this.parameterCurator, ${p.name}, ${p.typeNames}, false, ${p.isRequired}));`
            );
            inputAssign.push(
                `.addInput(input${p.name})`
            );
        }

        return `
        builder(node) 
        {
            ${inputDeclare.join('\n')}

            var inpAct = new Input("act", "Act", Socket.action);            
            var outThen = new Output('then', "Then", Socket.action);
            return node
                ${inputAssign.join('')}
                .addInput(inpAct)
                .addOutput(outThen);
        }`;
    }
    _templatizeWorker(actionDescriptor)
    {
        return `
        worker(node, inputs, outputs, runAction) 
        {
            return runAction(node.name, node.data);
        }`;
    }
}