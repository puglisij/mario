

const PRIMITIVE_TYPE = new Enum([
    "STRING", 
    "BOOLEAN", 
    "BOOL",
    "NUMBER"
]);

export class ActionParameters
{
    /**
     * Determines if an action parameter type name is convertable to primitive type
     * that can be edited as a regular input (e.g. a text input)
     * @param {string} typeName e.g. "string"
     * @returns {PRIMITIVE_TYPE}
     */
    static toPrimitiveEditorType(typeName)
    {
        return PRIMITIVE_TYPE.parse(typeName.trim().toUpperCase());
    }
    static isPrimitiveType(typeName) 
    {
        return this.toPrimitiveEditorType(typeName) !== undefined;
    }
}