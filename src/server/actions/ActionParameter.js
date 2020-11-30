/**
 * Describes an (Input) parameter to a JSX Action function
 * READONLY
 */

export default class ActionParameter {
    constructor() {
        this.name = "";
        this.description = "";
        this.typeNames = [];
        this.isRequired = false;
        this.defaultValue = null;
    }

    static fromJSDoc(jsdocParameter) {
        const { name, description, defaultValue, optional, type } = jsdocParameter;
        const param = new ActionParameter();
        param.name = name;
        param.description = description;
        param.defaultValue = defaultValue || null;
        param.isRequired = !(optional === true);
        param.typeNames = type.names.slice(0);

        return param;
    }
}
