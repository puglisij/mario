import jsdocApi from "jsdoc-api";
import JsDoc from "./JsDoc";


/**
 * Reads JSX action files and their JSDoc descriptions
 * NOTE: jsdoc-api should not be used to read action files individually as this 
 * creates individual caches per file, and is also much slower. 
 */
export default class JsDocStore 
{
    constructor()
    {
        this._typeNameToJSDoc = new Map();

    }
    /**
     * Reads and caches the JsDocDescription's for all the given actions
     * @param {Action[]} actions 
     * @returns {Promise<JsDocStore>}
     */
    async load(actions) 
    {
        const files = actions.map(a => a.absolutePath);
        return jsdocApi.explain({
            files,
            cache: true,
            //private: false  // Currently a bug with jsdoc which interprets this false as a file name
        })
        .then(descriptions => 
        {
            for(let i = 0; i < descriptions.length; ++i) 
            {
                const description = descriptions[i];
                if(JsDoc.isUnDocumented(description)) {
                    continue;
                }
                if(JsDoc.isPrivate(description)) {
                    continue;
                }
                // TODO: Require @exports tag for non action definitions?
                // TODO: What happens if name is empty?
                this._typeNameToJSDoc.set(description.longname, description);
            }
            return this;
        });
    }
    /**
     * Returns JS Doc descriptions for all 'action' and 'input' functions
     * @returns {import("./JsDoc").JSDocDescription[]}
     */
    getFunctions() 
    {
        return [];
    }
    getInstances()
    {

    }
    getConstructors()
    {

    }
}