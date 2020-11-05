/**
 * 
 */
class ActionParameterToReteControl
{
    constructor(hostInterface)
    {
        this.host = hostInterface;
        this.typeNameToDataCache = {};
    }
    /**
     * Convert jsdoc parameter type name to Vue control component type
     * @param {string} typeName any type for which a control exists (e.g. string, boolean, etc)
     * @returns {string} 
     */
    typeNameToControlInputType(typeName)
    {
        // call jsx functions to get type information
        // this.host.runJsx('...');
    }
}