/**
 * Describes an (Input) parameter to a JSX Action function
 * READONLY
 */

export default class ActionParameterDescriptor {
    constructor() {
        this.name = "";
        this.description = "";
        this.typeNames = [];
        this.isRequired = false;
        this.defaultValue = null;
        this.canUseControl = false;
    }

    static fromJSDoc(jsdocParameter) 
    {
        const { name, description, defaultValue, optional, type } = jsdocParameter;
        const param = new ActionParameterDescriptor();
        param.name = name;
        param.description = description;
        param.defaultValue = defaultValue || null;
        param.isRequired = !(optional === true);
        param.typeNames = type.names.slice(0);
        param.canUseControl = false; // TODO: Get type info from type service....
        return param;
    }
}
