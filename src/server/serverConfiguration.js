import fs from "fs";
import _ from "../utils";


// Utility method to get and set objects that may or may not exist
function nestifier(nests, create, context) 
{
    let result = context || {};
    for(let i = 0, s; result && (s = nests[i]); i++) 
    {
        if(s in result) {
            result = result[s];
        } else {
            result = (create ? result[s] = {} : undefined)
        }
    }
    return result;
}
const NestedObject = {
    set: function(name, value, context) 
    {
        let nests = name.split('.');
        let lastNest = nests.pop();
        let result = nestifier(nests, false, context);
        if (result && lastNest) {
            return result[lastNest] = value;
        }
        return undefined;
    },
    get: function(name, context) 
    {
        return nestifier(name.split('.'), false, context);
    },
    exists: function(name, context) 
    {
        return this.get(name, false, context) !== undefined;
    }
};

class ServerConfiguration
{
    constructor()
    {
        this.config = {};
        this.configPath = "";
    }

    /**
     * Load configuration json at given path. Returns "actual" config object
     */
    load(configPath) 
    {
        const configJson = fs.readFileSync(configPath);     
        const config = JSON.parse(configJson);
        this.config = config;

        return config;
    }
    clone()
    {
        return _.simpleDeepClone(this.config);
    }
    /**
     * Returns property by given key. E.g. "foo.bar"
     * @param {string} key config property name
     */
    get(key) 
    {
        const value = NestedObject.get(key, this.config);
        return _.simpleDeepClone(value);
    }
    /**
     * Sets the property at the given key. Does not create a new property if one doesnt exist.
     */
    set(key, value)
    {
        NestedObject.set(key, value, this.config);

        if(this.configPath) {
            this._saveConfiguration(name);
        }
    }
    // TODO make async. avoid multiple writes at same time
    // TODO debounce
    async _saveConfiguration(name)
    {
        const data = JSON.stringify(this.config);
        fs.writeFile(this.configPath, data);
    }
}

export default ServerConfiguration;