
/**
 * @typedef JSDocDescription
 * @type {object}
 * @property {string} comment the full jsdoc comment for this item
 * @property {*} meta data about this item, such as the filename, line #, and column #
 * @property {string} name 
 * @property {string} longname the fully qualified name (e.g. MyClass#myPrivateVar)
 * @property {string} kind class, constant, function, member, etc
 * @property {string} scope static, instance, inner, or global
 * @property {string} [description] 
 * @property {string} [access] private, public, protected, etc
 * @property {string} [memberof] belongs to this parent symbol (e.g. MyClass)
 * @property {*} [defaultValue] the default value, if defined
 * @property {JSDocParameter[]} [params]
 * @property {JSDocProperty[]} [properties] 
 * @property {JSDocException[]} [exceptions]
 * @property {boolean} [deprecated] 
 * @property {boolean} [undocumented] 
 * @property {boolean} [isEnum] true when @ enum is in comment
 * @property {boolean} [readonly]
 * @property {JSDocReturn[]} [returns] 
 */
/**
 * @typedef JSDocParameter
 * @type {object}
 * @property {string} name 
 * @property {JSDocType} [type] user should always define the type
 * @property {boolean} [variable] a variable number of these parameters
 * @property {boolean} [optional] 
 * @property {string} [description]
 */
/**
 * @typedef JSDocType
 * @type {object}
 * @property {string[]} names an array of type names 
 */

export default class JsDoc
{
    static isUnDocumented(jsdocDescription) 
    {
        return jsdocDescription.undocumented === true;
    }
    static isPrivate(jsDocDescription) 
    {
        return jsDocDescription.scope === "inner"
            || jsDocDescription.scope === "instance"
            || jsDocDescription.access === "private";
    }
    static isActionFunction(jsdocDescription) 
    {
        // Scope is 'static' because every action function must be defined on the 'action.' or 'input.' object
        return jsdocDescription.scope === "static" 
            && jsdocDescription.kind === "function"
            && (jsdocDescription.memberof === "action" || jsDocDescription.memberof === "input");
    }
    static isEnum(jsdocDescription) 
    {
        return jsdocDescription.scope === "global"
            && jsdocDescription.kind === "member"
            && jsdocDescription.isEnum === true
            && typeof jsdocDescription.memberof === undefined;
    }
}