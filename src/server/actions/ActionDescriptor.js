import ActionParameter from "./ActionParameter";

/**
 * Describes a JSX Actions signature in full, including parameters
 * READONLY
 */
export default class ActionDescriptor
{
    constructor()
    {
        this.name = "";
        this.description = "";
        this.path = "";
        this.parameters = [];
        this.returnDescription = "";
        this.returnTypeNames = [];
    }
    /**
     * Translate JSDocDescription object to ActionDescriptor
     * @param {JSDocDescription} jsDocDescription the "function" description returned by JSDoc
     */
    static fromJSDoc(jsdocDescription)
    {
        /*
            Example JSDoc Output:
            {
                "name": "action.makeNote",
                "description": "Add a Note/Annotation to the document",
                "path": "C:\\Users\\puglisij\\AppData\\Roaming\\Adobe\\CEP\\extensions\\com.mario.panel\\public\\actions",
                "params": [
                    {
                    "type": { "names": ["Number"] },
                    "description": "x axis position in pixels",
                    "name": "posX"
                    },
                    {
                    "type": { "names": ["Number"] },
                    "description": "y axis position in pixels",
                    "name": "posY"
                    }
                ],
                "returns": [{
                    description: "nothing",
                    type: {
                        names: ["undefined"]
                    }
                }]
            }
        */
        
        // Destructure
        const { 
            longname: name,
            description,
            params,
            meta: { path },
            returns
        } = jsdocDescription;

        const descriptor = new ActionDescriptor();
              descriptor.name = name;
              descriptor.description = description;
              descriptor.parameters = params ? params.map(p => ActionParameter.fromJSDoc(p)) : [];
              descriptor.path = path;
        if(returns) {
            descriptor.returnDescription = returns[0].description;
            descriptor.returnTypeNames = returns[0].type ? returns[0].type.names : [];
        }
        return descriptor;
    }
}

