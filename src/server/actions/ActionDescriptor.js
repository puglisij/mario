import ActionParameterDescriptor from "./ActionParameterDescriptor";

/**
 * Describes a JSX Actions signature in full, including parameters
 * @readonly
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
        this.isDeprecated = false;
        this.isInputAction = false;
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
            
            Becomes:
            {
                name: "action.makeNote",
                description: "Add a Note/Annotation to the document",
                parameters: [{
                    name: "posX",
                    description: "x axis position in pixels",
                    defaultValue: null,
                    isRequired: false,
                    typeNames: ["Number"]
                }, {
                    name: "posY",
                    description: "y axis position in pixels",
                    defaultValue: null,
                    isRequired: false,
                    typeNames: ["Number"]
                }],
                path: "C:\\Users\\puglisij\\AppData\\Roaming\\Adobe\\CEP\\extensions\\com.mario.panel\\public\\actions",
                returnsDescription: "nothing",
                returnTypeNames: ["undefined"],
                isDeprecated: false,
                isInputAction: false
            }
        */
        
        // Destructure
        const { 
            longname: name,
            description,
            params,
            meta: { path },
            returns,
            deprecated
        } = jsdocDescription;

        const descriptor = new ActionDescriptor();
              descriptor.name = name;
              descriptor.description = description;
              descriptor.parameters = params ? params.map(p => ActionParameterDescriptor.fromJSDoc(p)) : [];
              descriptor.path = path;
              descriptor.isDeprecated = deprecated || false;
        if(returns) {
            descriptor.returnDescription = returns[0].description;
            descriptor.returnTypeNames = returns[0].type ? returns[0].type.names : [];
        }
        return descriptor;
    }
}

