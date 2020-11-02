import EventEmitter from "events";

/**
 * @fires HostCallbackTunnelSetTimeout#enter immediately after setTimeout() is called
 * @fires HostCallbackTunnelSetTimeout#exit when setTimeout() callback is complete. this.close() is called immediately after this event.
 */
export default class HostCallbackTunnelSetTimeout extends EventEmitter
{
    constructor() 
    {
        super();

        this.timeoutId = 0;
        this.tunnelId = 0;
    }
    get name() {
        return "setTimeout";
    }
    getId() {
        return this.tunnelId;
    }
    setId(id) {
        this.tunnelId = id;
    }
    /**
     * Execute the setTimeout() tunnel
     * @param {string} stream the raw parameters string (e.g. "<callback id>, 1000")
     */
    open(stream) 
    {
        const data = stream.split(",");
        const callbackId = Number(data[0]);
        const delay = Number(data[1]);

        this.stream = stream;
        this.timeoutId = setTimeout(() =>
        {
            this.timeoutId = 0;
            this.emit("exit", `executeSetTimeoutCallback(${callbackId})`);
            this.close();
        }, delay);

        this.emit("enter");
    }
    /**
     * Force clears the setTimeout
     */
    close()
    {
        if(this.timeoutId)
            clearTimeout(this.timeoutId);
        
        this.removeAllListeners();
    }
}