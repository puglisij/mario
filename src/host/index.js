import EventEmitter from "events";
import upath from 'upath';

import HostCallbackTunnelExec from './hostCallbackTunnelExec';
import HostCallbackTunnelSetTimeout from './hostCallbackTunnelSetTimeout';
import appGlobal from '../global';
import store from '../store';


/*
    Creative Suite Extendscript Interface / Decorator
*/
class Host extends EventEmitter
{
    constructor() 
    {
        super();
        /**
         * To reduce coupling with GUI, this raw interface should not be used in Vue components
         */
        this.interface = new CSInterface();
        this._initialized = false;
        this._nextTunnelId = 0;
        this._tunnelIdToTunnel = new Map();
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
        this.importScript("console.jsx");
        this.importScript("json.jsx"); 
        this.importScript("events.jsx");
        this.importScript("image.jsx"); 
        
        // Listeners
        this.interface.addEventListener("log", event => {
            console.log("Jsx Log: ", event.data);
        });
        // Tunnel Listeners
        this.interface.addEventListener("exec", this._onExec.bind(this));
        this.interface.addEventListener("setTimeout", this._onSetTimeout.bind(this));

        console.log(`Host initialized.\n
            Install Path: ${appGlobal.appInstallPath}\n
            Working Path: ${appGlobal.appWorkingPath}\n
            Default Log Path: ${appGlobal.appDefaultLogPath}\n
            Default Config Path: ${appGlobal.appDefaultConfigPath}\n
            Builtin Action Path: ${appGlobal.appBuiltinActionsPath}\n
            Creative Suite API Version: ${appGlobal.adobeCEPApiVersion}\n
            OS: ${appGlobal.os}\n
            App Version: ${appGlobal.appVersion}`);
            
        return Promise.resolve();
    }
    destroy()
    {
        for(const [id, tunnel] of this._tunnelIdToTunnel) {
            tunnel.close();
        }
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
    /**
     * Returns a promise that is fulfilled when all jsx callbacks are completed (e.g. setTimeout() and exec())
     * @returns {Promise}
     */
    join() {
        if(this._nextTunnelId === 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => 
        {
            this.once("host.callback.join", resolve);
        });
    }
    _onSetTimeout(event)
    {
        const tunnel = new HostCallbackTunnelSetTimeout();
        this._openTunnel(tunnel, event.data);
    }
    _onExec(event) 
    {
        const tunnel = new HostCallbackTunnelExec(
            store.general.pathToUserActions,
            store.general.execTimeout
        );
        this._openTunnel(tunnel, event.data);
    }
    _openTunnel(tunnel, stream) 
    {
        const tunnelId = this._nextTunnelId++;
        this._tunnelIdToTunnel.set(tunnelId, tunnel);

        tunnel.setId(tunnelId);
        tunnel.once("enter", () => {
            console.log(`Tunnel ${tunnel.getId()}: ${tunnel.name}\n\t ${stream}\n\t Entered.`);
        });
        tunnel.once("exit", (jsx) => {
            console.log(`Tunnel ${tunnel.getId()}: ${tunnel.name}\n\t ${stream}\n\t Exited.\nWith Jsx:\n\t${jsx}`);
            this._exitTunnel(tunnel, jsx);
        });
        tunnel.open(stream);
    }
    _exitTunnel(tunnel, jsx) 
    {
        this._tunnelIdToTunnel.delete(tunnel.getId());

        this.runJsxWithThrow(jsx)
        .finally(() => 
        {
            console.log(`Tunnel ${tunnel.getId()} Finished Executing Jsx Callback.`);

            if(this._tunnelIdToTunnel.size === 0) {
                this._nextTunnelId = 0;
                this.emit("host.callback.join");
            }
        });
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
        console.log(`Action: ${functionName}`);
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