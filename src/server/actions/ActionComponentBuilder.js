
import ActionComponent from './ActionComponent';

export default class ActionComponentBuilder
{
    /**
     * Constructs a Rete Component instance the given jsx action names
     * @param {import("./ActionFileJSDocStore)} jsDocStore 
     * @returns {ActionComponent[]}
     */
    static build(jsDocStore) 
    {
        const actionJsDocs = jsDocStore.getActionsAndInputs();

        const components = actionDescriptors.map(d => 
        {
            const component = new ActionComponent(d);
            return component;
        });
        return components;
    }
}