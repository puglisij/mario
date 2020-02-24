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
export class ActionParameter 
{
    constructor() 
    {
        this.description = "";
        this.name = "";
        this.typeNames = [];
        this.isOptional = false;
        this.defaultValue = null;
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
    _getPathFromActionName(actionName)
    {
        const nameParts = actionName.split('.');
        const nameWithoutFirstNamespace = nameParts.slice(1).join('.');
        if(nameParts[0] === this._defaultNamespace) {
            return upath.join(this._rootPathToActions, nameWithoutFirstNamespace + ".jsx");
        } else {
            return upath.join(this._rootPathToActions, actionName + ".jsx");
        }
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

export class ActionDescriptorToReteComponentGenerator
{
    generateReteComponents(actionDescriptors)
    {

    }
}