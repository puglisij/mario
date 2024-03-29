import EventEmitter from "events";
import child_process from 'child_process';

/**
 * @fires HostCallbackTunnelExec#enter immediately after exec() is called
 * @fires HostCallbackTunnelExec#exit when exec() callback is complete. this.close() is called immediately after this event.
 */
export default class HostCallbackTunnelExec extends EventEmitter
{
    constructor(cwd, timeoutSec) 
    {
        super();

        this.cwd = cwd;
        this.childProcess = null;
        this.tunnelId = 0;
        this.timeout = timeoutSec;
    }
    get name() {
        return "exec";
    }
    getId() {
        return this.tunnelId;
    }
    setId(id) {
        this.tunnelId = id;
    }
    /**
     * Execute the exec() tunnel
     * @param {string} stream the raw parameters string (e.g. "<callback id>, cp myFile.txt newFile.txt")
     */
    open(stream) 
    {
        this.emit("enter");

        const data = stream.split(",");
        const callbackId = Number(data[0]);
        const command = data[1];

        try 
        {
            /*
                Since ExtendScript can't execute shell commands without blocking. 
                We're hijacking node.js exec() here.
            */
            this.childProcess = child_process.exec(command, 
                {
                    cwd: this.cwd,
                    // TODO: Make timeout a setting in GUI
                    timeout: this.timeout * 1000 // terminate long running processes
                }, 
                (err, stdout, stderr) => 
                {
                    this.childProcess = null
                    let jsx = "";
        
                    if(err) {
                        console.error(err);
                        console.log(stderr);
                    } else {
                        stdout = JSON.stringify(stdout);
                        stderr = JSON.stringify(stderr);
                        jsx = `executeExecCallback(${callbackId},${stdout},${stderr});`;
                    }
        
                    this.emit("exit", jsx);
                    this.close();
                });
        }
        catch(e) {
            console.error(e);
            this.emit("exit", "");
            this.close();
        }
    }
    /**
     * Sends a SIGTERM to the child process
     */
    close()
    {
        if(this.childProcess !== null && !this.childProcess.killed) 
            this.childProcess.kill();

        this.removeAllListeners();
    }
}


