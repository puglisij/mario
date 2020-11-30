
import ActionComponent from './ActionComponent';

export default class ActionComponentBuilder
{
    /**
     * Constructs a Rete Component instance the given jsx action names
     * @param {import("./actionDescriptor)[]} actionNames 
     * @returns {ActionComponent[]}
     */
    static build(actionDescriptors) 
    {
        const components = actionDescriptors.map(d => {
            const component = new ActionComponent(d);
            return component;
        });
        return components;
    }
}