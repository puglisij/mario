/**
 * Simple object representing a JSX Action
 * @property {string} name the namespaced name of the file (e.g. action.foo)
 * @property {string} namespace the parent namespace (e.g. action)
 * @property {string} absolutePath the absolute path to this file
 */
export default class JsxFile
{
    constructor(name, namespace, absolutePath)
    {
        this.name = name;
        this.namespace = namespace;
        this.absolutePath = absolutePath;
    }
}