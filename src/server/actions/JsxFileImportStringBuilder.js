import upath from 'upath';
import fs from 'fs';

import JsxFile from './JsxFile';

/**
 * @typedef {Object} JsxFileImportResult 
 * @property {string} importString the stringified JSX script to run which will import all actions
 * @property {JsxFile[]} actions the array of Action instances representing each imported action 
 */

/**
 * Handles reading JSX action files for import into Adobe host
 * Expects the following directory structure
 * root 
 *   |_ action
 *   |_ input
 *   |_ source
 * 
 * NOTE: Any files within the root directory are not imported.
 * Any files within the the source directory are imported without a namespace. 
 * It's up to the user to ensure the global namespace is not polluted.
 */
export default class JsxFileImportStringBuilder
{
    /**
     * Reads all jsx files in the given directory and builds an import JSX string for execution.
     * Each new subdirectory encountered becomes a nested namespace.
     * @param {string} pathToActions the directory containing the jsx files
     * @returns {JsxFileImportResult} 
     */
    static build(pathToActions)
    {
        const names = fs.readdirSync(pathToActions);
        const found = names.reduce((found, name) => (found[name] = true, found), {});
        
        // Create missing directories
        for(const name of ['action', 'input', 'source'])
        {
            if(!found[name]) {
                const path = upath.join(pathToActions, name);
                fs.mkdirSync(path);
            } 
        }

        // Build jsx import data
        const results = [
            this._import(pathToActions, "action", true),
            this._import(pathToActions, "input", true),
            this._import(pathToActions, "source", false)
        ];

        // Combine
        return results.reduce((combined, r) => {
            combined.files = combined.files.concat(r.files);
            combined.importString = combined.importString.concat(r.importString);
            return combined;
        }, {
            files: [],
            importString: ""
        });
    }
    static _import(rootDirectory, subDirectory, doDefineNamespace)
    {
        let files = [];
        let imports = [];
        let directory;
        let directories = [
            {
                namespace: subDirectory,
                absolutePath: upath.join(rootDirectory, subDirectory)
            }
        ];
        while(directory = directories.pop()) 
        {
            if(doDefineNamespace) {
                imports.push(
                    `${directory.namespace}= typeof ${directory.namespace} !== "undefined" ? ${directory.namespace} : {};`
                );
            }
            
            const names = fs.readdirSync(directory.absolutePath);
            for(let name of names) 
            {
                const nameWithoutExtension = this._fileNameWithoutExtension(name);
                const namespace = `${directory.namespace}.${nameWithoutExtension}`;
                const absolutePath = upath.join(directory.absolutePath, name);
                if(fs.statSync(absolutePath).isDirectory()) 
                {
                    // Traverse directory
                    directories.push({
                        namespace,
                        absolutePath
                    });
                } 
                else 
                {
                    // Import file
                    imports.push(`importJsx("${absolutePath}");`);
                    files.push(new JsxFile(namespace, directory.namespace, absolutePath));
                }
            }
        }
        return {
            importString: imports.join(''),
            files
        };
    }
    static _fileNameWithoutExtension(name) 
    {
        const nameParts = name.split('.');
        if(nameParts.length > 2) {
            throw new Error("Jsx file and directory names cannot contain periods.");
        }
        return nameParts[0];
    }
}
