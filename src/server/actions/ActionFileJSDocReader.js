import jsdoc from "jsdoc-api";

/**
 * Reads JSX action files and their JSDoc descriptions
 * NOTE: jsdoc-api should not be used to read action files individually as this 
 * creates individual caches per file, and is also much slower. 
 */
export default class ActionFileJSDocReader 
{
    /**
     * Reads and caches the JsDocDescription's for all the given actions
     * @param {Action[]} actions 
     * @returns {Promise<Object[]>}
     */
    static async readAll(actions) 
    {
        return jsdoc.explain({
            cache: true,
            files: actions.map(a => a.absolutePath)
        })
        .then(descriptions => 
        {
            const actionDescriptions = [];
            for(let i = 0; i < descriptions.length; ++i) 
            {
                const description = descriptions[i];
                if(this._isFunction(description)) {
                    actionDescriptions.push(description);
                }
            }
            return actionDescriptions;
        });
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