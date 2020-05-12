import upath from 'upath';
import fs from 'fs';
import jsdocx from 'jsdocx';
import EventEmitter from "events";

import store from '../store';
import host from '../host';
import global from '../global';

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

class ActionParameterCurator
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
class ActionFileDescriptionReader 
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
class ActionFileImportStringBuilder
{
    /**
     * Reads all jsx files in the given directory and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @returns {string} the stringified JSX script to run which will import all actions
     */
    build(pathToActions, defaultNamespace)
    {
        return this._buildJsxImportString(pathToActions, "", defaultNamespace); 
    }
    // NOTE: importAction() is expected to be defined on Host JSX side
    _buildJsxImportString(pathToActions, namespace, defaultNamespace)
    {
        let namespacePrefix = `${defaultNamespace}.`;
        let namespaceDefine = `${defaultNamespace}= ${defaultNamespace} || {};`;
        let areInRootPath = true;
        if(namespace) {
            namespacePrefix = `${namespace}.`;
            namespaceDefine = `${namespace}= ${namespace} || {};`;
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

/**
 * Primary interface for loading/reloading jsx action files and their JSDoc descriptions
 */
export class Actions
{
    constructor() 
    {
        this._importStringBuilder = new ActionFileImportStringBuilder();
    }
    /**
     * @returns {Promise}
     */
    init() 
    {
        return this._importAll();
    }
    destroy() {}

    /**
     * Import all JSX function action files
     */
    async _importAll()
    {
        console.log("Import actions started.");

        await this._import(global.appBuiltinActionsPath);
        await this._import(store.general.pathToUserActions);

        console.log("Import actions exited.");
    }
    _import(importDirectory) 
    {
        if(!importDirectory.trim()) {
            return;
        }
        const importString = this._importStringBuilder.build(importDirectory, "action");
        return host.runJsx(importString);
    }

    /**
     * @returns {string[]}
     */
    getAllActionNames() {}
    /**
     * @param {string} actionName
     * @returns {ActionDescriptor}  
     */
    getActionDescriptorByName(actionName) {}

}
