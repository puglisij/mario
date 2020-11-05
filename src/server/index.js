
/* npm modules */
import EventEmitter from "events";
import polka from "polka";

/* local modules */
import { PipelineEngine } from './pipelineEngine';
import { Actions } from './actions';
import _ from '../utils';
import store from '../store';
import global from '../global';

let port = 0;
let app = null;


export const ServerState = {
    UNINITIALIZED: 0,
    RUNNING: 1
};

/**
 * Backend systems.
 * Manages Node REST API, and JS API for managing pipelines. 
 * Server is not CEP panel aware
 */
class Server extends EventEmitter
{
    constructor() 
    {
        super();
        this._initialized = false;
        this._state = ServerState.UNINITIALIZED;

        // Express instance
        this._httpServer = null;
        this._pipelineEngine = new PipelineEngine();
        this._actions = new Actions();
    }
    /**
     * @returns {Promise}
     */
    async init() 
    {
        if(this._initialized) return;
        this._initialized = true;

        await this._actions.init();
        await this._pipelineEngine.init();

        if(store.general.runHttpServer) {
            this.startServer();
        }
        this.state = ServerState.RUNNING;
        this.emit("initialized");
        console.log("Server initialized.");
    }
    async startServer() 
    {
        port = store.general.serverPort;
        app = polka();
        //-----------------
        // Routes
        //-----------------
        // app.get('/pipeline/:name/configuration', (req, res) => {
        //     res.setHeader("Content-Type", "application/json");
        //     res.end(
        //         JSON.stringify(this._pipelineConfig.pipelines.find(p => p.name == req.params.name.toLowerCase()), null, 4)
        //     );
        // });
        // app.post('/pipeline/run', (req, res) => {
        //     res.status(200).json({ success: true });
        // });
        // app.post('/pipeline/stop', (req, res) => {
        //     res.status(200).json({ success: true });
        // });
        app.get('/status', (req, res) => {
            const status = {
                adobeApp: global.adobeApp,
                adobeVersion: global.adobeVersion,
                version: global.appVersion,
                time: new Date().toLocaleString(),
                ...this._pipelineEngine.fullStatus
            };

            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(status, null, 2) + '\n');
        });

        //-----------------
        // Create Server
        //-----------------
        this._httpServer = app.listen(port, "0.0.0.0", function() {
            console.log(`Polka is listening to http://localhost:${port}`);
        }).server;

        // Native
        // this._httpServer = http.createServer((req, res) => 
        // {
        //      handle routing on req.url
        // });
        // this._httpServer.listen(port, "0.0.0.0", () => {
        //     console.log(`Server is listening to http://localhost:${port}`);
        // });

        console.log("Server started.");
    }
    destroy() 
    {
        console.log(`Server closing...`);
        this._httpServer && this._httpServer.close(() => {
            this._httpServer = null;
            console.log(`Server closed.`);
        });
        this._pipelineEngine.destroy();
        this._pipelineEngine = null;
        this._actions.destroy();
        this._actions = null;
    }
    get pipelineEngine() {
        return this._pipelineEngine;
    }
    get actions() {
        return this._actions;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        this.emit("state", value);
    }
}
// DELETE. Note, to access in iframe use iframe.contentWindow.server
// TODO: For DEBUG Only. When finished, remove "window.server = " from export.
export default (window.server = new Server());