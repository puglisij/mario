import upath from 'upath';
import fs from 'fs';

import Action from './Action';

/**
 * @typedef {Object} ActionFileImportResult 
 * @property {string} importString the stringified JSX script to run which will import all actions
 * @property {Action[]} actions the array of Action instances representing each imported action 
 */

/**
 * Handles reading JSX action files for import into Adobe host
 */
export default class ActionFileImportStringBuilder
{
    /**
     * Reads all jsx files in the given directory and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @param {string} pathToActions the directory containing the jsx files
     * @param {string} rootNamespace the root action function namespace. All action names with start with this
     * @returns {ActionFileImportResult} 
     */
    static build(pathToActions, rootNamespace)
    {
        return this._buildJsxImportString(pathToActions, rootNamespace); 
    }
    // NOTE: importAction() and importJsx() is expected to be defined on Host JSX side
    static _buildJsxImportString(absolutePathToActions, rootNamespace)
    {
        // Import /input
        // Import /actions
        // Import /source (no namespace)
        // TODO: Allow user to define own nodes?
        // TODO: Does all native API need wrapped in an action function? ideally, no!
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
