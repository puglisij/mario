
/* npm modules */
import debounce from 'debounce'; 
import EventEmitter from "events";
import express from "express";

/* local modules */
import { PipelineEngine } from './pipelineEngine';
import PipelineEngineState from './pipelineEngineState';
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

// DELETE. Note, to access in iframe use iframe.contentWindow.actions
// TODO: For DEBUG Only. When finished, move new Actions() inside Server constructor.
window.actions = new Actions(); 

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
        this._actions = window.actions;
    }
    /**
     * @returns {Promise}
     */
    async init() 
    {
        if(this._initialized) return;
        this._initialized = true;

        await this._pipelineEngine.init();
        await this._actions.init();

        if(store.general.runHttpServer) {
            this.startServer();
        }
        this.state = ServerState.RUNNING;
        this.emit("initialized");
        console.log("Server initialized.");
    }
    async startServer() 
    {
        app = express();
        port = store.general.serverPort;
        //-----------------
        // Express Routes
        //-----------------
        // TODO Replace Express with WebSockets (e.g. sockjs)?
        // app.get('/pipeline/:name/configuration', (req, res) => {
        //     res.header("Content-Type", "application/json");
        //     res.send(
        //         JSON.stringify(this._pipelineConfig.pipelines.find(p => p.name == req.params.name.toLowerCase()), null, 4)
        //     );
        // });
        // app.post('/pipeline/run', (req, res) => {
        //     res.status(200).json({ success: true });
        // });
        // app.post('/pipeline/stop', (req, res) => {
        //     res.status(200).json({ success: true });
        // });
        // app.use((req, res, next) => {
        //     res.status(404).send("Sorry, can't find that!");
        // });
        // app.use((err, req, res, next) => {
        //     console.error(err.stack);
        //     res.status(500).send('Something broke!')
        // });
        app.get('/status', (req, res) => {
            //res.status(200).json(this._pipelineEngine.status);
            res.type('json').send(JSON.stringify(this._pipelineEngine.status, null, 2) + '\n');
        });

        //-----------------
        // Create Server
        //-----------------
        this._httpServer = app.listen(port, function() {
            console.log(`Express is listening to http://localhost:${port}`);
        });
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

export default new Server();