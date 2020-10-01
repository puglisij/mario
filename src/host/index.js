import os from 'os';
import upath from 'upath';
import appGlobal from '../global';
import { reject } from 'async';

/*
    Creative Suite Extendscript Interface / Decorator
*/
class Host 
{
    constructor() 
    {
        /**
         * To reduce coupling with GUI, don't use this raw interface in Vue components
         */
        this.interface = new CSInterface();
        this._initialized = false;
    }
    /**
     * @returns {Promise}
     */
    init() 
    {
        if(this._initialized) return;
        this._initialized = true;

        // Host Environment Setup
        this.importScript("utils.jsx");
        this.importScript("polyfil.jsx");
        this.importScript("json.jsx"); 
        this.importScript("image.jsx"); 
        
        // Listeners
        this.interface.addEventListener("log", event => {
            console.log("Jsx Event: " + event.data);
        });
        this.interface.addEventListener("setTimeout", this.onSetTimeout.bind(this));

        const apiVersion = this.interface.getCurrentApiVersion();
        console.log(`Host initialized.\n
            Install Path: ${appGlobal.appInstallPath}\n
            Working Path: ${appGlobal.appWorkingPath}\n
            Default Log Path: ${appGlobal.appDefaultLogPath}\n
            Builtin Action Path: ${appGlobal.appBuiltinActionsPath}\n
            Temporary Path: ${appGlobal.appTemporaryPath}\n
            Creative Suite API Version: ${apiVersion.major}.${apiVersion.minor}.${apiVersion.micro}\n
            OS: ${this.interface.getOSInformation()}`);
            
        return Promise.resolve();
    }
    destroy()
    {
        
    }
    /*---------------------
            Events
    ---------------------*/
    dispatchEvent(eventName, data) 
    {
        const scope = "APPLICATION";
        const event = new CSEvent(eventName, scope);
              event.data = data;
        this.interface.dispatchEvent(event);
    }
    onSetTimeout(event)
    {
        var data = event.data.split(",");
        var callbackId = Number(data[0]);
        var delay = Number(data[1]);

        var _this = this;
        setTimeout(function()
        {
            // Since ExtendScript doesn't have a setTimeout. We're hijacking the event loop here.
            _this.runJsx(`executeSetTimeoutCallback(${callbackId})`)
            .then(result => {
                if(result.includes("error")) {
                    console.error(result);
                }
            })
        }, delay);
    }
    /*---------------------
        Extend Script
    ---------------------*/
    // NOTES:
    // ActionReference is what to perform the action on within Photoshop  (e.g. document, marque tool, etc)
    // The Action Manager system keeps track of a large number of Descriptors keys relative to the status of:
    // - The Application
    // - Documents
    // - Layers
    // - Channels
    // - Paths
    // - History
    // - ActionSets and Actions 

    /**
     * Import/Execute an ExtendScript file, such as a library.
     * @param {string} fileName - name of file relative to app distribution path
     */
    async importScript(fileName) 
    {
        const importPath = upath.join(appGlobal.appWorkingPath, fileName);
        const result = await this.runJsx(`importJsx("${importPath}");`);
        console.log("Jsx File Imported: " + importPath + " Result: " + result);
    }
    /**
     * Evaluate ExtendScript/JSX script on Host
     * @param {string} script 
     * @returns {Promise}
     */
    runJsx(script) 
    {
        return new Promise(resolve => {
            this.interface.evalScript(script, result => {
                resolve(result);
            })
        });
    }
    /**
     * Evaluate ExtendScript/JSX script on Host and throw an Exception if string "error" or "exception" is in the result.
     * NOTE: If result is 'Evalscript error.' there may be a syntax error in the script string
     * @param {string} script 
     * @returns {Promise}
     */
    runJsxWithThrow(script) 
    {
        return new Promise((resolve, reject) => 
        {
            this.interface.evalScript(`(function(){
                try {
                    ${script}
                } catch(e) {
                    return e.toString();
                }
            }())`, 
            (result) => {
                const lowerCaseResult = result.toLowerCase();
                if(lowerCaseResult.includes("error") || lowerCaseResult.includes("exception")) {
                    reject(`\nJsx:\n${script}\nException in Result:\n${result}\n`);
                } else {
                    resolve(result);
                }
            })
        });
    }
    /**
     * Run the ExtendScript action function by the given name
     * @param {string} functionName 
     * @param {number|string|boolean|object|array} parameters 
     * @returns {Promise}
     */
    runActionWithParameters(functionName, parameters)
    {
        const parametersJson = JSON.stringify(parameters);
        return this.runJsxWithThrow(`
            var result = ${functionName}(${parametersJson});
            return result;
        `);
    }
    
    /**
     * Converts an Action Manager charId to a stringId
     * Returns empty string if error occurred.
     * @param {string} charId 
     */
    convertCharToStringId(charId) {
        return this.runJsx(`t2s(c2t('${charId}'))`)
        .then(result => {
            return result.includes("error") ? "" : result;
        });
    }
    /**
     * Converts an Action Manager stringId to a charId
     * Returns empty string if error occurred.
     * @param {string} charId 
     */
    convertStringToCharId(stringId) {
        return this.runJsx(`t2c(s2t('${stringId}'))`)
        .then(result => {
            return result.includes("error") ? "" : result;
        });
    }
}

export default new Host();