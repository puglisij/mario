import upath from 'upath';
import fs from 'fs';
import EventEmitter from "events";
const jsdoc = require("jsdoc-api");
//import jsdocx from 'jsdoc-x';

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
     * Translate JSDocXDescription object to ActionDescriptor
     * @param {JSDocXDescription} jsDocXDescription the description object returned by JSDocX
     */
    static fromJSDocXDescription(jsDocXDescription)
    {
        // jsdocx.utils.getFullName
        // jsdocx.utils.isMethod
        
        // TODO Make this function another class?
        const description = jsDocXDescription.filter(x => x.$kind === "method");
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

/**
 * 
 */
class ActionParameterCurator
{
    constructor(hostInterface)
    {
        this.host = hostInterface;
        this.typeNameToDataCache = {};
    }
    /**
     * Convert jsdoc parameter type name to Vue control component type
     * @param {string} typeName any type for which a control exists (e.g. string, boolean, etc)
     * @returns {string} 
     */
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
    /**
     * Returns mapping of fully qualified action names to their JSXDocDescription
     * @param {Action[]} actions 
     * @returns {Object}
     */
    static read(actions)
    {
        let map = new Map();
        let promises = actions.map(action => 
        {
            const { name, absolutePath } = action;
            return this._readJSDocXDescription(absolutePath)
            .then(description => {
                map.set(name, description);
            });
        })
        return Promise.all(promises).then(() => {
            return map;
        });
    }
    /**
     * Returns the JSDocX object describing the particulars of the given action
     * @param {string} actionPath the absolute action path e.g. C:/actions/action.saveDocument.jsx
     * @returns {JSDocXDescription}
     */
    static _readJSDocXDescription(actionPath)
    {
        return jsdoc.explain({
            files: [actionPath]
        });
        // return jsdocx.parse(actionPath, {
        //         undocumented: false // include undocumented symbols
        //         //output: "output/path" // path for JSON to be created (cache)
        //     })
        //     .then(description => {
        //         return description;
        //     });
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
     * @param {string} pathToActions the directory containing the jsx files
     * @param {string} rootNamespace the root action function namespace. All action names with start with this
     * @returns {string} the stringified JSX script to run which will import all actions
     */
    static build(pathToActions, rootNamespace)
    {
        return this._buildJsxImportString(pathToActions, rootNamespace); 
    }
    // NOTE: importAction() is expected to be defined on Host JSX side
    static _buildJsxImportString(absolutePathToActions, rootNamespace)
    {
        let actions = [];
        let imports = [];
        let directory;
        let directories = [
            {
                namespace: rootNamespace,
                absolutePath: absolutePathToActions
            }
        ];
        while(directory = directories.pop()) 
        {
            const namespace = directory.namespace;
            const namespaceDefine = `${namespace}= (typeof ${namespace} !== "undefined") ? ${namespace} : {};`;
            imports.push(namespaceDefine);
            
            const names = fs.readdirSync(directory.absolutePath);
            for(let i = 0; i < names.length; ++i) 
            {
                const nameParts = names[i].split('.');
                if(nameParts.length > 2) {
                    throw new Error("Action file and directory names cannot contain periods.");
                }

                const name = nameParts[0];
                const nameSpacedName = `${namespace}.${name}`;
                const path = upath.join(directory.absolutePath, names[i]);
                if(fs.statSync(path).isDirectory()) 
                {
                    directories.push({
                        namespace: nameSpacedName,
                        absolutePath: path
                    });
                } 
                else 
                {
                    imports.push(`importAction("${path}", "${nameSpacedName}");`);
                    actions.push(new Action(nameSpacedName, path));
                }
            }
        }
        return {
            importString: imports.join(''),
            actions
        };
    }
}

class Action
{
    constructor(name, absolutePath)
    {
        this.name = name;
        this.absolutePath = absolutePath;
    }
}

/**
 * Primary interface for loading/reloading jsx action files and their JSDoc descriptions
 */
export class Actions
{
    constructor() 
    {
        this._actions = [];
        this._actionCategories = [
            {
                category: "action",
                categories: [
                    {
                        category: "action.universal",
                        categories: [],
                        actions: []
                    },
                    {
                        category: "action.product",
                        categories: [],
                        actions: []
                    }
                ],
                actions: []
            }
        ];
        this._actionToJSDocXCache = new Map();
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
    async _import(importDirectory) 
    {
        if(!importDirectory.trim()) {
            return;
        }
        const { importString,  actions } = ActionFileImportStringBuilder.build(importDirectory, "action");
        ActionFileDescriptionReader.read(actions)
        .then(actionToJsDocXMap => {
            // Merge mapping into cache
            this._actionToJSDocXCache = new Map([...this._actionToJSDocXCache, ...actionToJsDocXMap]);
        });

        this._actions = [...this._actions, actions];
        return host.runJsx(importString  + "act = action;");
    }
    /**
     * Return all available action nested namespaces/categories
     * @returns {string[]} multi dimensional array containing category/subcategory names
     */
    getAllActionCategories() {
        return this._actionCategories; // TODO: Return clone for safety?
    }
    /**
     * Return all available action names
     * @returns {string[]}
     */
    getAllActionNames() {
        return this._actions.map(a => a.name);
    }
    /**
     * Converts JSDocX for given action name to instance of ActionDescriptor
     * @param {string} actionName
     * @returns {ActionDescriptor}  
     */
    getActionDescriptorByName(actionName) 
    {
        const jsDocXDescription = this._actionToJSDocXCache[actionName];
        const actionDescriptor = ActionDescriptor.fromJSDocXDescription(jsDocXDescription);
        return actionDescriptor;
    }

}
