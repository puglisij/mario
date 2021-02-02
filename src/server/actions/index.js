import JsxFile from './JsxFile';
import JsxFileImportStringBuilder from './JsxFileImportStringBuilder';
import JsDocStore from './JsDocStore';
import ActionDescriptorBuilder from './ActionDescriptorBuilder';
import ActionComponentBuilder from './ActionComponentBuilder';
import ActionDescriptor from "./ActionDescriptor";
import store from '@/store';
import host from '@/host';
import global from '@/global';
import FolderTreeNode from '@/folderTree';


/**
 * Action Manager
 * Primary interface for loading/reloading jsx action files, 
 * and building their respective ActionDescriptors and ActionComponents.
 */
export class Actions
{
    constructor() {}

    /**
     * @returns {Promise}
     */
    init() 
    {
        // Clear caches / action data
        this._actionTree = new FolderTreeNode("", true);
        this._actionNameToAction = new Map();
        this._actionNameToActionDescriptor = new Map();
        this._actionNameToActionComponent = new Map();
        this._jsDocStore = new JsDocStore();
        return this._importAll();
    }
    destroy() {}

    async _importAll()
    {
        const pathToUserActions = store.general.pathToUserActions;
        const pathToBuildInActions = global.appBuiltinActionsPath;

        console.log("Import actions started.");
        console.log(`Importing:\n\t${pathToBuildInActions}`);     
        await this._import(pathToBuildInActions);

        if(pathToUserActions) 
        {
            console.log(`Importing:\n\t${pathToUserActions}`);
            await this._import(pathToUserActions);
            await host.runJsx(`action.CUSTOM_ACTIONS_FOLDER = new Folder("${pathToUserActions}");`);
        }

        console.log("Import actions exited.");
    }
    async _import(importDirectory) 
    {
        if(!importDirectory.trim()) {
            return;
        }

        const { importString, files } = JsxFileImportStringBuilder.build(importDirectory);

        // Action -> JSDoc
        const jsDocs = await this._jsDocStore.load(files);
        console.log("JSDoc Store loaded.");
        // JSDoc -> ActionDescriptor
        // const descriptors = ActionDescriptorBuilder.build(jsDocs);
        // // ActionDescriptor -> ActionComponent
        // const components = ActionComponentBuilder.build(descriptors);

        // // Cache descriptors
        // for(const d of descriptors) {
        //     this._actionNameToActionDescriptor.set(d.name, d);
        // }
        // // Cache components
        // for(const c of components) {
        //     this._actionNameToActionComponent.set(c.name, c);
        // }

        await host.runJsx(importString);
    }
    /**
     * Returns tree structure of all available action nested namespaces/action names
     * @returns {FolderTreeNode} n-ary tree indicating folder and action file structure
     */
    getAllActionsTree() {
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
     * @returns {Promise<ActionDescriptor>} by reference
     */
    async getActionDescriptorByName(actionName) 
    {
        const action = this._actionNameToAction.get(actionName);
        if(!action) {
            throw new Error(`Action doesnt exist by name ${actionName}`);
        }

        return new Promise(resolve => {
            const descriptor = this._actionNameToActionDescriptor.get(actionName);
            resolve(descriptor);
        });
    }
    /**
     * @param {string} actionName
     * @returns {Promise<ActionComponent>} ActionComponent is returned by reference
     */
    async getActionComponentByName(actionName)
    {
        return new Promise(resolve => {
            const component = this._actionNameToActionComponent.get(actionName);
            resolve(component);
        });
    }
    /**
     * @returns {Promise<ActionComponent[]>} ActionComponents are returned by reference
     */
    async getAllActionComponents()
    {
        return new Promise(resolve => {
            const components = Array.from(this._actionNameToActionComponent.values());
            resolve(components);
        });
    }
}