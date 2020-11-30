import ActionDescriptor from "./ActionDescriptor";

export default class ActionDescriptorBuilder
{
    /**
     * Translate JSDocDescription objects to ActionDescriptors
     * @param {JSDocDescription[]} jsDocDescriptions 
     * @returns {ActionDescriptor[]}
     */
    static build(jsDocDescriptions) 
    {
        return jsDocDescriptions.map(d => ActionDescriptor.fromJSDoc(d));
    }
}