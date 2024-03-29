import os from 'os';
import fs from 'fs';
import upath from 'upath';
import host from './index';

/**
 * Creative Suite Extendscript Script Listener Interface
 */
class HostScriptListener
{
    constructor() {
        this._scriptListenerActive = false;
        this._scriptListenerReaderActive = false;

        this._scriptListenerJsLogsPath = upath.join(os.homedir(), "Desktop", "ScriptingListenerJS.log");
        this._scriptListenerVbLogsPath = upath.join(os.homedir(), "Desktop", "ScriptingListenerVB.log");
    }
    /**
     * @returns {Promise}
     */
    init() 
    {
        console.log("HostScriptListener initialized.");
        return Promise.resolve();
    }
    destroy()
    {
        // Cleanup
    }
    startScriptListenerReader()
    {
        // Determine if ScriptListener is on 
        // Folder.desktop
        // const listenerLogsPath =  upath.join(os.homedir(), "Desktop", "ScriptingListenerJS.log");
        // const scriptWatcher = chokidar.watch(listenerLogsPath, {
        //     awaitWriteFinish: {
        //         pollInterval: 100,
        //         stabilityThreshold: 2000
        //     }
        // });
        // scriptWatcher.on("change", debounce(this.readScriptListenerLog, 1000));
        // //...
        // scriptWatcher.removeAllListeners();
        // scriptWatcher.close();
        // //...

        this._scriptListenerReaderActive = true;
    }
    stopScriptListenerReader() 
    {

    }
    clearScriptListenerLogs() 
    {
        fs.writeFile(this._scriptListenerJsLogsPath, "", err => {
            if(err) throw err; 
        });
        fs.writeFile(this._scriptListenerVbLogsPath, "", err => {
            if(err) throw err;
        });
    }
    onScriptListenerLogs() 
    {
        // IMPORTANT: Somme commands generated by ScriptListenerPlugin will not run via evalScript.
        // In particular, modal commands, such as "modalStateChanged" will throw an error
        // fs.readFile(path, (err, data) => {
        //     if(err) throw err; 

        //     fire event? or call registered callback?
        // });
    }
    isScriptListenerActive() 
    {
        let initialSize = 0;
        try {
            initialSize = fs.statSync(this._scriptListenerJsLogsPath).size;
        } catch {}
        
        // How this works:
        // Since Extendscript runs on a single thread, and ScriptListener runs on this same thread.
        // The 1st call triggers ScriptListener to record actions.
        // The 2nd call is to ensure ScriptListener is done recording, before we read log file stats.
        return Promise.all([
            host.runJsx(`
                app.bringToFront();
                var document = app.documents.add("1px", "1px", 1, "ScriptListenerCheck");
                document.close(SaveOptions.SAVECHANGES);
            `),
            host.runJsx(`noop();`)
        ])
        .then(values => {
            if(values[0].includes("error")) {
                console.error("Could not determine if ScriptListener is active.");
                return false;
            }
            try {
                fs.statSync(this._scriptListenerJsLogsPath).size > initialSize;
            } catch {
                return false;
            }
        });
    }
    isScriptListenerIstalled()
    {
        return host.runActionWithParameters("action.getIsScriptListenerInstalled")
        .then(result => Boolean(result));
    }
    toggleScriptListener(active)
    {
        return host.runActionWithParameters("action.setScriptListenerActive", active);
    }
}

export default new HostScriptListener();