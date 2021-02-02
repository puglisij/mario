
import ActionComponent from './ActionComponent';

export default class ActionComponentBuilder
{
    /**
     * Constructs a Rete Component instance the given jsx action names
     * @param {import("./JSDocStore)} jsDocStore 
     * @returns {ActionComponent[]}
     */
    static build(jsDocStore) 
    {
        const actionJsDocs = jsDocStore.getActions();

        const components = actionJsDocs.map(d => 
        {
            const component = new ActionComponent(d);
            return component;
        });
        return components;
    }
}