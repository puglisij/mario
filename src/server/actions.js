import upath from 'upath';
import fs from 'fs';
import jsdoc from "jsdoc-api";

import store from '../store';
import host from '../host';
import global from '../global';
import FolderTreeNode from '../folderTree';

const ROOT_ACTION_NAMESPACE = "action";

/**
 * Simple object representing a JSX Action
 */
class Action
{
    constructor(name, namespace, absolutePath)
    {
        this.name = name;
        this.namespace = namespace;
        this.absolutePath = absolutePath;
    }
}

/**
 * Describes a JSX Actions signature in full, including parameters
 * READONLY
 */
export class ActionDescriptor
{
    constructor()
    {
        this.name = "";
        this.description = "";
        this.path = "";
        this.params = [];
        this.returnDescription = "";
        this.returnTypeNames = [];
    }
    /**
     * Translate JSDocDescription object to ActionDescriptor
     * @param {JSDocDescription} jsDocDescription the "function" description returned by JSDoc
     */
    static fromJSDoc(jsdocDescription)
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
                ],
                "returns": [{
                    description: "nothing",
                    type: {
                        names: ["undefined"]
                    }
                }]
            }
        */
        
        // Destructure
        const { 
            longname: name,
            description,
            params,
            metadata: { path },
            returns: [{ 
                description: returnDescription,
                type: { names: returnTypeNames }
            }] 
        } = jsdocDescription;

        const descriptor = new ActionDescriptor();
              descriptor.name = name;
              descriptor.description = description;
              descriptor.params = params ? params.map(p => ActionParameter.fromJSDoc(p)) : [];
              descriptor.path = path;
              descriptor.returnDescription = returnDescription;
              descriptor.returnTypeNames = returnTypeNames || [];
        return descriptor;
    }
}

/**
 * Describes an (Input) parameter to a JSX Action function
 * READONLY
 */
export class ActionParameter 
{
    constructor() 
    {
        this.name = "";
        this.description = "";
        this.typeNames = [];
        this.isRequired = false;
        this.defaultValue = null;
    }

    static fromJSDoc(jsdocParameter) {
        const { name, description, defaultValue, optional, type } = jsdocParameter;
        const param = new ActionParameter();
            param.name = name;
            param.description = description;
            param.defaultValue = defaultValue || null;
            param.isRequired = !(optional === true);
            param.typeNames = type.names.slice(0);

        return param;
    }
}

/**
 * Reads JSX action files and creates a cached mapping of JSDoc descriptions they contain.
 * Mapping:
 *  Action -> JSDoc descriptions 
 */
class ActionFileDescriptionReader 
{
    static _actionNameToJsDoc = new Map();
    /**
     * Reads and caches the JsDocDescription's for all the given actions
     * @param {Action[]} actions 
     */
    static async readAll(actions) 
    {
        return jsdoc.explain({
            cache: true,
            files: actions.map(a => a.absolutePath)
        })
        .then(descriptions => 
        {
            for(let i = 0; i < descriptions.length; ++i) 
            {
                const description = descriptions[i];
                if(this._isFunction(description)) {
                    this._actionNameToJsDoc.set(description.longname, description);
                }
            }
        });
    }
    /**
     * Caches and returns the JsDocDescription for the given action
     * @param {Action} action
     * @returns {JSDocDescription}
     */
    static read(action)
    {
        let description = this._actionNameToJsDoc.get(action.name);
        if(!description) {
            console.warn(`JSDoc description not found for action ${action.name}. Do you need to re-load actions?`);
            return {};
        }
        return description;
    }
    // FUNCTIONS:
    // scope: "static"
    // kind: "function"
    // memberof: "action"
    static _isFunction(jsdocDescription) 
    {
        return jsdocDescription.scope === "static"
            && jsdocDescription.kind === "function"
            && jsdocDescription.memberof.startsWith("action");
    }
    // ENUMERATIONS:
    // name starts with capital letter
    // scope: "global"
    // kind: "member"
    // memberof: undefined
    // isEnum: true (only if @enum is in comment)
    static _isEnum(jsdocDescription) 
    {
        return jsdocDescription.scope === "global"
            && jsdocDescription.kind === "member"
            && jsdocDescription.isEnum === true
            && typeof jsdocDescription.memberof === undefined;
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
            
            // Read directory contents
            const names = fs.readdirSync(directory.absolutePath);
            for(let i = 0; i < names.length; ++i) 
            {
                const nameParts = names[i].split('.');
                if(nameParts.length > 2) {
                    throw new Error("Action file and directory names cannot contain periods.");
                }

                const nameWithoutExtension = nameParts[0];
                const nameSpacedName = `${namespace}.${nameWithoutExtension}`;
                const absoluteFilePath = upath.join(directory.absolutePath, names[i]);
                if(fs.statSync(absoluteFilePath).isDirectory()) 
                {
                    directories.push({
                        namespace: nameSpacedName,
                        absolutePath: absoluteFilePath
                    });
                } 
                else 
                {
                    imports.push(`importAction("${absoluteFilePath}", "${nameSpacedName}");`);
                    actions.push(new Action(nameSpacedName, namespace, absoluteFilePath));
                }
            }
        }
        return {
            importString: imports.join(''),
            actions
        };
    }
}


/**
 * Primary interface for loading/reloading jsx action files and their JSDoc descriptions
 */
export class Actions
{
    constructor() 
    {
        this._actionNameToAction = new Map();
        this._actionTree = new FolderTreeNode(ROOT_ACTION_NAMESPACE, true);
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
        const pathToUserActions = store.general.pathToUserActions;
        const pathToBuildInActions = global.appBuiltinActionsPath;
        console.log("Import actions started.");
        console.log(`Importing from:\n\t${pathToUserActions}\n\t${pathToBuildInActions}`);
        
        await this._import(pathToBuildInActions);
        if(pathToUserActions) 
        {
            await this._import(pathToUserActions);
            await host.runJsx(`action.CUSTOM_ACTIONS_FOLDER = new Folder("${pathToUserActions}");`);
        }

        console.log("Import actions exited.");
    }
    _import(importDirectory) 
    {
        if(!importDirectory.trim()) {
            return;
        }

        const { importString,  actions } = ActionFileImportStringBuilder.build(importDirectory, ROOT_ACTION_NAMESPACE);
        // Parse to data structures
        for(let i = 0; i < actions.length; ++i) 
        {
            const actionPath = actions[i].name.split('.');
            this._actionNameToAction.set(actions[i].name, actions[i]);
            this._actionTree.insert(actionPath, false);
            console.log("Action: " + actions[i].name);
        }
        // Async read and cache jsdoc info
        ActionFileDescriptionReader.readAll(actions);

        return host.runJsx(importString  + "act = action;");
    }
    /**
     * Returns tree structure of all available action nested namespaces/action names
     * @returns {FolderTreeNode} n-ary tree indicating folder and action file structure
     */
    getAllActions() {
        return this._actionTree.cloneTree(); 
    }
    /**
     * Return all available action names
     * @returns {string[]}
     */
    getAllActionNames() {
        return Array.from( this._actionNameToAction.keys() );
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

        return new Promise(resolve => {
            const d = ActionFileDescriptionReader.read(action)
            const descriptor = ActionDescriptor.fromJSDoc(d);
            resolve(descriptor);
        });
    }
}