import jsdocx from 'jsdocx';
import EventEmitter from "events";

class Action
{
    constructor()
    {
        this.name = "";
        this.params = [];
    }
}
Action.fromJSDocDescription = function(jsdocDescription)
{
    const description = jsdocDescription.filter(x => x.$kind === "method");
    const action = new Action();
            action.name = description.$longname;
            action.params = description.params;
    return action;
};

/**
 * Manages Importing JSX Action files and their metadata
 */
class Actions
{
    /**
     * Reads all jsx files in the given directory recursively, and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @param {string} pathToActions the current path to the jsx action files
     * @param {string} defaultNamespace The default namespace for actions in the root path 
     */
    constructor(pathToActions, defaultNamespace)
    {
        this._pathToActions = pathToActions;
        this._defaultNamespace = defaultNamespace;
        this._actionDescriptionCache = {};
    }

    getPathFromActionName(actionName)
    {
        const nameParts = actionName.split('.');
        if(nameParts[0] === this._defaultNamespace) {

        }
    }
    /**
     * Returns an object describing the particulars of the given action
     * @param {string} actionName the action name e.g. action.saveDocument
     * @returns {object}
     */
    getActionDescription(actionName)
    {
        if(this._actionDescriptionCache[actionName]) {
            return this._actionDescriptionCache[actionName];
        }

        const path = this.getPathFromActionName(actionName);
        return jsdocx.parse(path)
            .then(description => {
                this._actionDescriptionCache[actionName] = description;
                return description;
            });
    }

    /**
     * Reads all jsx files in the directory given during construction and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     */
    loadActionPaths()
    {
        return this._loadActionPath(this._pathToActions, "", this._defaultNamespace); 
    }
    _loadActionPath(pathToActions, namespace, defaultNamespace)
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
                        nextScript = this.loadActionPath(nextPath, name);
                    else 
                        nextScript = this.loadActionPath(nextPath, namespacePrefix + name);
                } else {
                    nextScript = `importAction("${nextPath}", "${nextActionName}");`;
                }
                return script + nextScript;
            }, 
            namespaceDefine);
    }
}

export default Actions;