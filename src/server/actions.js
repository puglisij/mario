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
        this.description = "";
        this.path = "";
        this.params = [];
    }
    /**
     * Translate JSDocDescription object to ActionDescriptor
     * @param {JSDocDescription} jsDocDescription the description object returned by JSDoc
     */
    static fromJSDocDescription(jsdocDescription)
    {
        /*
            Example JSDoc Output:
            {
                "name": "action.makeNote",
                "description": "Add a Note/Annotation to the document",
                "path": "C:\\Users\\puglisij\\AppData\\Roaming\\Adobe\\CEP\\extensions\\com.mario.panel\\public\\actions",
                "params": [
                    {
                    "type": { "names": ["Number"] },
                    "description": "x axis position in pixels",
                    "name": "posX"
                    },
                    {
                    "type": { "names": ["Number"] },
                    "description": "y axis position in pixels",
                    "name": "posY"
                    }
                ]
            }
        */
        
        // TODO Make this function another class?
        const description = jsdocDescription.find(x => x.kind === "function");
        const descriptor = new ActionDescriptor();
              descriptor.name = description.longname;
              descriptor.description = description.description;
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
     * @param {Action} action
     * @returns {jsdocDescription}
     */
    static read(action)
    {
        const { name, absolutePath } = action;
        return this._readJSDocDescription(absolutePath)
        .then(description => {
            return description;
        });
    }
    /**
     * Returns the JSDoc object describing the particulars of the given action
     * @param {string} actionPath the absolute action path e.g. C:/actions/action.saveDocument.jsx
     * @returns {JSDocDescription}
     */
    static _readJSDocDescription(actionPath)
    {
        //TODO: Use jsdoc-api cache
        return jsdoc.explain({
            cache: true,
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
        this._actionNameToAction = new Map();
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
        const { importString,  actions } = ActionFileImportStringBuilder.build(importDirectory, "action");
        for(let i = 0; i < actions.length; ++i) 
        {
            this._actions.push(actions[i]);
            this._actionNameToAction.set(actions[i].name, actions[i]);
        }

        return host.runJsx(importString  + "act = action;");
    }
    _parseCategories()
    {
        for(let i = 0; i < actions.length; ++i) 
        {
            const action = actions[i];

        }
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
     * Converts JSDoc for given action name to instance of ActionDescriptor
     * @param {string} actionName
     * @returns {Promise<ActionDescriptor>}  
     */
    async getActionDescriptorByName(actionName) 
    {
        const action = this._actionNameToAction.get(actionName);
        if(!action) {
            throw new Error(`Action doesnt exist by name ${actionName}`);
        }

        return ActionFileDescriptionReader.read(action)
        .then(jsDocDescription => {
            return ActionDescriptor.fromJSDocDescription(jsDocDescription);
        });
    }

}
