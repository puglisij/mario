import upath from 'upath';
import fs from 'fs';
import jsdocx from 'jsdocx';
import EventEmitter from "events";

/**
 * Describes a JSX Actions signature in full, including parameters
 */
export class ActionDescriptor
{
    constructor()
    {
        this.name = "";
        this.path = "";
        this.params = [];
    }
    /**
     * @param {JSDocXDescription} jsDocDescription the description object returned by JSDocX
     */
    static fromJSDocDescription(jsDocDescription)
    {
        // TODO Make this function another class?
        const description = jsDocDescription.filter(x => x.$kind === "method");
        const descriptor = new ActionDescriptor();
              descriptor.name = description.$longname;
              descriptor.params = description.params; // TODO convert to ActionParameter
              descriptor.path = description.meta.path;
        return descriptor;
    }
}
/**
 * Describes an (Input) parameter to a JSX Action function
 */
export class ActionParameter 
{
    constructor() 
    {
        this.description = "";
        this.name = "";
        this.typeNames = [];
        this.isRequired = false;
        this.defaultValue = null;
    }
}

export class ActionParameterCurator
{
    constructor(hostInterface)
    {
        this.host = hostInterface;
        this.typeNameToDataCache = {};
    }
    typeNameToControlInputType(typeName)
    {
        // call jsx functions to get type information
        // this.host.runJsx('...');
    }
}

/**
 * Handles reading JSX action files and their JSDoc descriptions
 */
export class ActionFileDescriptionReader 
{
    constructor(rootPathToActions, defaultNamespace)
    {
        this._rootPathToActions = rootPathToActions;
        this._defaultNamespace = defaultNamespace;
        this._actionToJSDocDescriptionCache = {};
    }

    /**
     * Reads the appropriate JSX action file and converts JSDoc to instance of ActionDescriptor
     * @param {string} actionName 
     * @returns {ActionDescriptor}
     */
    getActionDescriptor(actionName)
    {
        const jsDocDescription = this._readJSDocDescription(actionName);
        const actionDescriptor = ActionDescriptor.fromJSDocDescription(jsDocDescription);
        return actionDescriptor;
    }
    /**
     * Returns the JSDocX object describing the particulars of the given action
     * @param {string} actionName the action name e.g. action.saveDocument
     * @returns {JSDocXDescription}
     */
    _readJSDocDescription(actionName)
    {
        if(this._actionToJSDocDescriptionCache[actionName]) {
            return this._actionToJSDocDescriptionCache[actionName];
        }

        const path = this._getPathFromActionName(actionName);
        return jsdocx.parse(path)
            .then(description => {
                this._actionToJSDocDescriptionCache[actionName] = description;
                return description;
            });
    }
    // TODO Move to its own class? (e.g.  ActionFileNameTranslator)
    _getFileNameFromActionName(actionName) 
    {
        if(actionName.startsWith(this._defaultNamespace + '.'))
            return actionName.split('.').slice(1).join('.') + ".jsx";
        else 
            return actionName + ".jsx";
    }
    _getPathFromActionName(actionName)
    {
        const actionFileName = this._getFileNameFromActionName(actionName);
        return upath.join(this._rootPathToActions, actionFileName);
    }
}

/**
 * Handles reading JSX action files for import into Adobe host
 */
export class ActionFileImportStringBuilder
{
    constructor(rootPathToActions, defaultNamespace)
    {
        this._rootPathToActions = rootPathToActions;
        this._defaultNamespace = defaultNamespace;
    }
    /**
     * Reads all jsx files in the given directory and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @returns {string} the stringified JSX script to run which will import all actions
     */
    buildJsxImportString()
    {
        return this._buildJsxImportString(this._rootPathToActions, "", this._defaultNamespace); 
    }
    // NOTE: importAction() is expected to be defined on Host JSX side
    _buildJsxImportString(pathToActions, namespace, defaultNamespace)
    {
        let namespacePrefix = `${defaultNamespace}.`;
        let namespaceDefine = `${defaultNamespace}={};`;
        let areInRootPath = true;
        if(namespace) {
            namespacePrefix = `${namespace}.`;
            namespaceDefine = `${namespace}={};`;
            areInRootPath = false;
        }
        
        // TODO make async
        return fs.readdirSync(pathToActions)
            .reduce((script, name) => 
            {
                let nextPath = upath.join(pathToActions, name);
                let nextActionName = namespacePrefix + name.split('.')[0];
                let nextScript;
                if(fs.statSync(nextPath).isDirectory()) 
                {
                    // if were in the root action directory, we dont want to include the default namespace prefix in
                    // other subdirectory actions
                    if(areInRootPath) 
                        nextScript = this._buildJsxImportString(nextPath, name);
                    else 
                        nextScript = this._buildJsxImportString(nextPath, namespacePrefix + name);
                } else {
                    nextScript = `importAction("${nextPath}", "${nextActionName}");`;
                }
                return script + nextScript;
            }, 
            namespaceDefine);
    }
}


// TODO: Could use a templating engine (e.g. Handlebars) here to make this more readable
export class ActionDescriptorToReteComponentGenerator
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


/**
 * CSInterface decorator.
 */
export class HostInterface
{
    constructor(csInterface)
    {
        this.cs = csInterface;
    }
    /**
     * Run the action function by the given name on the Adobe host
     * @param {string} actionName 
     * @param {number|string|boolean|object|array} parameters 
     * @returns {Promise}
     */
    runActionWithParameters(actionName, parameters)
    {
        const parametersJson = JSON.stringify(parameters);
        console.log(`Running Action: ${actionName}`);
        return this.runJsx(`(function(){
            try {
                var result = ${actionName}(${parametersJson});
                return result;
            } catch(e) {
                return e.toString();
            }
        }())`);
    }
    /**
     * Run the given raw jsx code on the Adobe host
     * @param {string} jsx 
     * @returns {Promise}
     */
    runJsx(jsx)
    {
        return new Promise((resolve, reject) => 
        {
            this.cs.evalScript(jsxString, function(result) 
            {
                if(result.toLowerCase().includes("error") 
                || result.toLowerCase().includes("exception")) {
                    const errorMessage = `Jsx: \n\t${jsxString}\nResult:\n${result}`;
                    console.error(errorMessage);
                    reject(errorMessage);
                } else {
                    resolve(result)
                }
            });
        });
    }
}