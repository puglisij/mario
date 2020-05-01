
/* npm modules */
import path from 'path';
import upath from 'upath';
import fs from 'fs';
import debounce from 'debounce'; 
import express from 'express';
import promisify from 'es6-promisify';
import EventEmitter from "events";


/* local modules */
import { ServerState } from './enum';
import { ImageFileProducer } from './imageFileProducer';
import Image from './image';
import _ from '../utils';
import store from '../store';
import global from '../global';

const port = 3001;
const app = express();



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
        // Express instance
        this._httpServer = null;
    }
    async init() 
    {
        if(this._initialized) return;
        this._initialized = true;

        //-----------------
        // Express Routes
        //-----------------
        app.get('/pipeline/:name/configuration', (req, res) => {
            res.header("Content-Type", "application/json");
            res.send(
                JSON.stringify(this._pipelineConfig.pipelines.find(p => p.name == req.params.name.toLowerCase()), null, 4)
            );
        });
        app.get('/status', (req, res) => {
            // search for files matching parameters 
            res.status(200).json({
                status: Object.keys(ServerState).find(p => ServerState[p] === this._state),
                needUserInteraction: false
            });
        });
        app.post('/run', (req, res) => {
            res.status(200).json({ success: true });
        });
        app.post('/stop', (req, res) => {
            res.status(200).json({ success: true });
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

        this.emit("init");
        console.log("Server initialized.");
    }
    run()
    {
        if(this.isStopped()) 
        {
            
            
        }

        this._state = ServerState.RUNNING;
        console.log(`Server run.`);
    }
    pause()
    {
        console.log(`Server pause.`);
        this._state = ServerState.PAUSED;
    }
    stop()
    {
        console.log(`Server stop.`);
        this._fileWatchers.forEach(watcher => {
            watcher.removeAllListeners();
            watcher.close();
        });
        this._state = ServerState.STOPPED;
    }
    destroy() 
    {
        console.log(`Server closing...`);
        this.stop();
        this._httpServer && this._httpServer.close(() => {
            console.log(`Server closed.`);
        });
    }
    pauseCheck(doPause)
    {
        if(doPause || this.isPaused()) 
        {
            this._state = ServerState.PAUSED;
            console.log("Server waiting on pause...");
            return new Promise(resolve => {
                this.once("state", newState => {
                    if(this._state != ServerState.PAUSED) {
                        resolve();
                    }
                });
            });
        }
    }
    /**
     * Read metadata, and notify CEP pipeline image is ready for processing 
     */
    async processImageAtPath(filePath, defaultType)
    {
        const sourceDirectory = upath.dirname(filePath);
        const fileName = upath.basename(filePath);
        console.log(`Added to Queue: ${fileName} Full Path: ${filePath} Default Type: ${defaultType}`);
        const reader = new Image.Reader(sourceDirectory, filePath, { type: defaultType });

        try {
            await reader.readProcessingData();
            await reader.readMetadata();
  
            const image = reader.getImage();
            this.pushToPipeline(image);
        } catch(e) {
            const image = reader.getImage();
            this.moveImageToErrored(image, e.toString());
            return;
        }
    }
    pushToPipeline(image)
    {
        this._pipelineImageQ.push(image);
        if(!this._pipelinesExecutingMutex) {
            console.log(`Running images through pipelines.`);
            this.runPipelines();
        }
    }
    makeImageDirectory(dir)
    {
        return new Promise(resolve => {
            fs.mkdir(dir, { recursive: true }, err => {
                if(err && !err.code == "EEXIST") 
                    console.error(err + "\nImage move failed. Could not create directory " + dir);
                resolve();
            });
        });
    }
    async moveImagePathsToDirectory(image, dir)
    {
        const allFiles = image.getAllFilePaths();
        for(const filePath of allFiles) 
        {
            const fileName = upath.basename(filePath);
            const toPath = upath.join(dir, fileName);
            fs.rename(filePath, toPath, err => {
                if(err) 
                    console.error(err + "\nImage could not be moved to " + toPath);
            });
        }
    }
    async moveImageToProcessed(image)
    {
        const processedDir = image.getProcessedDirectory();
        await this.makeImageDirectory(processedDir);
        this.moveImagePathsToDirectory(image, processedDir);
    }
    async moveImageToErrored(image, message)
    {
        const errorDir = image.getErrorDirectory();
        const errorLogPath = upath.join(errorDir, "error.logs");
        await this.makeImageDirectory(errorDir);
        this.moveImagePathsToDirectory(image, errorDir);

        fs.writeFile(errorLogPath, [   
            `\n`,
            `Time: ${new Date().toLocaleString()}`,
            `imagePath: ${image.imagePath}`, 
            `dataPath: ${image.dataPath}`, 
            message
        ].join(`\n`), 
        {
            flag: 'a'
        },
        err => {
            if(err) 
                console.error(err + "\nImage Errored but logs could not be written to " + errorLogPath);
        });
    }
    /**
     * Run images through pipeline per its configuration
     * Only one image may run through the Photoshop at one time
     */
    async runPipelines()
    {
        this._pipelinesExecutingMutex = true; // mutex
        let image = null;

        await this.runJsx(`app.displayDialogs = DialogModes.NO;`);
        while(image = this._pipelineImageQ.pop())
        {
            const pipelines = this.pipelinesMap[image.type.toLowerCase()];
            if(!pipelines) {
                console.error(`Pipeline not found for image: ${image.imagePath} type: ${image.type}`);
                continue;
            }

            try 
            {
                await this.runPipelineImageStart(image);

                for(const pipeline of pipelines) 
                {
                    if(pipeline.disabled) {
                        console.log(`Skipping disabled pipeline ${pipeline.name}`);
                        continue;
                    }
                    
                    console.log(`Pipeline ${pipeline.name} started for image: ${image.imagePath}`);
                    this.emit("pipelinestart", image.type);
                    
                    // Run Actions
                    for(const jsxAction of pipeline.externalActions) 
                    {
                        this.emit("action", jsxAction.action);
                        // Call jsx action by name with config parameters 
                        let result = await this.runAction(jsxAction.action, jsxAction.parameters);

                        await this.pauseCheck(this._config.pauseAfterEveryAction);
                        if(result === "EXIT") break;
                        if(this.isStopped()) break;
                    }
                    
                    console.log(`Pipeline ${pipeline.name} completed for image: ${image.imagePath || image.dataPath}`);
                    await this.runJsx(`closeAll();`);
                    await this.pauseCheck(this._config.pauseAfterEveryPipeline);
                    if(this.isStopped()) break;
                }
                    
                this.moveImageToProcessed(image);
            }
            catch(e) 
            {
                await this.pauseCheck(this._config.pauseOnExceptions);
                this.moveImageToErrored(image, e.toString());
            }
            finally 
            {
                this.emit("pipelineend", image.type);
                await this.runPipelineImageEnd(image);
                await this.pauseCheck(this._config.pauseAfterEveryImage);
                if(this.isStopped()) break;
            }
        }
        await this.runJsx(`closeAll(); $.gc();`);
        this.updateMemoryStats();
        this._pipelinesExecutingMutex = false;
        console.log("Pipeline queue finished.");
    }
    async loadActions()
    {
        await this.loadActionPaths(global.appBuiltinActionsPath, "action");
        console.log("Loaded built-in actions."); 

        await this.loadActionPaths(this._config.pathToUserActions, "action");
        console.log("Loaded user actions."); 
    }
    /**
     * Reads all jsx files in the given directory recursively, and builds an import JSX string and executes.
     * Each new directory encountered becomes a nested namespace.
     * @param {string} pathToActions the current path to the jsx action files
     * @param {string} defaultNamespace The default namespace for actions in the root path 
     * @returns {Promise}
     */
    loadActionPaths(pathToActions, defaultNamespace)
    {
        if(!fs.existsSync(pathToActions)) {
            console.warn(`Actions path not found for ${pathToActions}`);
            return Promise.resolve(null);
        }

        const actionScript = this.loadActionPath(pathToActions, "", defaultNamespace); 
        return this.runJsx(actionScript);
    }
    loadActionPath(pathToActions, namespace, defaultNamespace)
    {
        let namespacePrefix = `${defaultNamespace}.`;
        let namespaceDefine = `${defaultNamespace}={};`;
        let areInRootPath = true;
        if(namespace) {
            namespacePrefix = `${namespace}.`;
            namespaceDefine = `${namespace}={};`;
            areInRootPath = false;
        }
        
        return fs.readdirSync(pathToActions)
            .reduce((script, name) => 
            {
                let nextPath = upath.join(pathToActions, name);
                let nextActionName = namespacePrefix + name.split('.')[0];
                let nextScript;
                if(fs.statSync(nextPath).isDirectory()) 
                {
                    // if were in the root action directory, we dont want to include the default namespace prefix in
                    // other subdirectory actions
                    if(areInRootPath) 
                        nextScript = this.loadActionPath(nextPath, name);
                    else 
                        nextScript = this.loadActionPath(nextPath, namespacePrefix + name);
                } else {
                    nextScript = `importAction("${nextPath}", "${nextActionName}");`;
                }
                return script + nextScript;
            }, 
            namespaceDefine);
    }
    /**
     * Close all documents. Save Photoshop settings. Instantiate IMAGE instance
     * @param {Image} image 
     * @returns {Promise}
     */
    runPipelineImageStart(image)
    {
        return this.runJsx(`closeAll();
        __PIPELINE = {};
        __PIPELINE.restoreUnits = _.saveUnits(); 
        IMAGE=new ImageForProcessing(${JSON.stringify(image)});`);
    }
    /**
     * Restore Photoshop settings.
     * @param {Image} image 
     * @returns {Promise}
     */
    runPipelineImageEnd(image)
    {
        return this.runJsx(`__PIPELINE.restoreUnits && __PIPELINE.restoreUnits(); IMAGE=null;`);
    }
    /**
     * Run the Photoshop JSX pipeline action function by the given name, with the given parameters
     * @param {string} actionName the jsx action function name (e.g. action.saveDocument)
     * @param {any} actionParameters the jsx action function parameters, either a primitive or object
     * @returns {Promise}
     */
    runAction(psActionName, actionParameters)
    {
        const psActionParameters = JSON.stringify(actionParameters);
        console.log(`Running Action: ${psActionName}`);
        return this.runJsx(`(function(){
            try {
                var result = ${psActionName}(${psActionParameters});
                return result;
            } catch(e) {
                return e.toString();
            }
        }())`);
    } 
    /**
     * Note that evalScript runs asynchronously, but Photoshop runs the code synchronously
     * @param {string} jsxString the jsx code string
     * @returns {Promise}
     */
    runJsx(jsxString)
    {
        return new Promise((resolve, reject) => 
        {
            this.cs.evalScript(jsxString, function(result) 
            {
                if(result.toLowerCase().includes("error") 
                || result.toLowerCase().includes("exception")) {
                    const errorMessage = `Jsx: \n\t${jsxString}\nResult:\n${result}`;
                    console.error(errorMessage);
                    reject(errorMessage);
                } else {
                    resolve(result)
                }
            });
        })
    }
    updateMemoryStats()
    {

        this.emit("stats" )
    }
}

export default new Server();