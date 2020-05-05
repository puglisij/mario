
/* npm modules */
import path from 'path';
import upath from 'upath';
import fs from 'fs';
import debounce from 'debounce'; 
import express from 'express';
import promisify from 'es6-promisify';
import EventEmitter from "events";


/* local modules */
import { PipelineEngine } from './pipelineEngine';
import _ from '../utils';
import store from '../store';
import global from '../global';

const port = 3001;
const app = express();


export const ServerState = {
    UNINITIALIZED: 0,
    RUNNING: 1
};

/**
 * Server manages Node REST API, and Js API for managing pipelines. 
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
    }
    async init() 
    {
        if(this._initialized) return;
        this._initialized = true;

        //-----------------
        // Express Routes
        //-----------------
        // TODO Replace Express with WebSockets?
        app.get('/pipeline/:name/configuration', (req, res) => {
            res.header("Content-Type", "application/json");
            res.send(
                JSON.stringify(this._pipelineConfig.pipelines.find(p => p.name == req.params.name.toLowerCase()), null, 4)
            );
        });
        app.post('/pipeline/run', (req, res) => {
            res.status(200).json({ success: true });
        });
        app.post('/pipeline/stop', (req, res) => {
            res.status(200).json({ success: true });
        });
        app.get('/status', (req, res) => {
            // search for files matching parameters 
            res.status(200).json({
                status: Object.keys(ServerState).find(p => ServerState[p] === this._state),
                needUserInteraction: false
            });
        });
        app.use((req, res, next) => {
            res.status(404).send("Sorry, can't find that!");
        });
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!')
        });

        //-----------------
        // Create Server
        //-----------------
        this._httpServer = app.listen(port, function() {
            console.log(`Express is listening to http://localhost:${port}`);
        });

        this.state = ServerState.RUNNING;
        console.log("Server initialized.");
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
    }
    get pipelineEngine() {
        return this._pipelineEngine;
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