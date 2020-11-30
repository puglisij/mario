/**
 * Simple object representing a JSX Action
 */
export default class Action
{
    constructor(name, namespace, absolutePath)
    {
        this.name = name;
        this.namespace = namespace;
        this.absolutePath = absolutePath;
    }
}