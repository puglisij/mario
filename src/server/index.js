
/* npm modules */
import upath from 'upath';
import fs from 'fs';
import chokidar from 'chokidar';
import debounce from 'debounce'; 
import express from 'express';
import promisify from 'es6-promisify';
import EventEmitter from "events";


/* local modules */
import Image from './image';
import ServerConfiguration from './serverConfiguration';
import _ from '../utils';

const ServerState = {
    UNINITIALIZED: 0,
    STOPPED: 1, 
    PAUSED: 2,
    RUNNING: 3
};
const port = 3001;
const app = express();

/**
 * Server manages Node REST Api, and File watching. 
 * Processes new Image (loads their data) jobs in preparation for Pipeline.
 * Server is not CEP panel aware
 * Features:
 *  - Simple REST api
 *  - Directory watching for image or json(data) files to process 
 *  - Configurable watchers, and pipelines
 */
export default class Server extends EventEmitter
{
    constructor(serverPath, actionPath) 
    {
        super();
        this.server = null;
        this.actionPath = actionPath;
        
        this.config = {};
        this.configPath = upath.join(serverPath, "config.json");
        this.configurator = null;
        this.pipelineConfig = {};
        this.pipelineConfigPath = upath.join(serverPath, "config-pipeline.json");
        this.pipelineConfigurator = null;
        
        // Path watcher instances for new images
        this.watchers = [];
        // Pipelines mapping type => pipeline actions
        this.pipelines = {};
        // Flag indicating configuration has changed and pipeline mapping needs reloaded
        this.needToReloadPipelines = true;
        // Images waiting for processing
        this.pipelineQueue = [];

        this.cs = new CSInterface();     
        this.cs.addEventListener("debug.pause", event => {
            this.pause();
        });
        this._isPipelinesRunningMutex = false;
        this._serverState = ServerState.UNINITIALIZED;
    }
    _loadConfiguration() 
    {
        this.configurator = new ServerConfiguration();
        this.config = this.configurator.load(this.configPath);
        if(!this.config.watchers) {
            throw new Error("Server config missing 'watchers'.");
        }
        console.log("Loaded server config: ");
        console.dir(this.config);
    }
    _loadPipelineConfiguration()
    {
        this.pipelineConfigurator = new ServerConfiguration();
        this.pipelineConfig = this.pipelineConfigurator.load(this.pipelineConfigPath);
        if(!this.pipelineConfig.pipelines) {
            throw new Error("Server pipeline config missing 'pipelines'.");
        }
    }
    _loadPipelineMapping()
    {
        for(const pipeline of this.pipelineConfig.pipelines)
        {
            const forType = pipeline.for.toLowerCase();
            _.getOrDefine(this.pipelines, forType, []).push(pipeline);
        }
        this.needToReloadPipelines = false;
    }
    getConfiguration() {
        return this.configurator.clone();
    }
    getPipelineConfiguration() {
        return this.pipelineConfigurator.clone();
    }
    setConfiguration(key, value) 
    {
        this.configurator.set(key, value);
        console.log(`Configuration ${key} changed to ${value}`);
    }
    setPipelineConfiguration(key, value) 
    {
        this.pipelineConfigurator.set(key, value);
        this.needToReloadPipelines = true;
        console.log(`Pipeline Configuration ${key} changed to ${value}`);
    }
    isPaused() {
        return this._state == ServerState.PAUSED;
    }
    isStopped() {
        return this._state == ServerState.STOPPED || this._state == ServerState.UNINITIALIZED;
    }
    get _state() {
        return this._serverState;
    }
    set _state(state) {
        this._serverState = state;
        this.emit("state", state);
    }
    async init() 
    {
        this._loadConfiguration();
        this._loadPipelineConfiguration();

        //-----------------
        // Load Actions 
        //-----------------
        let actionScript = this.loadActionPaths(this.actionPath, "action");
        let loadActionsResult = await this.runJsx(actionScript);
        console.log("Loaded actions."); 

        //-----------------
        // Setup routes
        //-----------------
        app.get('/activedocument', (req, res) => {
            this.cs.evalScript("_.getDocumentPath()", function(activeDocumentPath) {
                res.status(200).send("Active Document: " + activeDocumentPath);
            });
        });
        app.get('/status', (req, res) => {
            // search for files matching parameters 
            res.status(200).json({
                status: Object.keys(ServerState).find(p => ServerState[p] === this._state),
                needUserInteraction: false
            });
        });
        app.post('/process', (req, res) => {
            // stream image file or zip to processing directory
            // stream json data to file in processing directory
            // process
            res.status(201).json({ success: false });
        });
        app.post('/start', (req, res) => {
            this.start();
            res.status(200).json({ success: true });
        });
        app.post('/stop', (req, res) => {
            this.stop();
            res.status(200).json({ success: true });
        });
        app.post('/restart', (req, res) => {
            this.restart();
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
        // Start server
        //-----------------
        this.server = app.listen(port, function() {
            console.log(`Express is listening to http://localhost:${port}`);
        });

        this._state = ServerState.STOPPED;
        this.emit("init");
    }
    async restart()
    {
        this.stop(); // TODO: Await this._isPipelinesRunningMutex === false ?
        this.start();
    }
    async start()
    {
        if(!this.isStopped()) {
            return;
        }

        console.log(`Server started.`);

        if (this.needToReloadPipelines) 
            this._loadPipelineMapping()

        //-----------------
        // Setup watchers 
        //-----------------
        for(const watcherConfig of this.config.watchers) 
        {
            const watchDefaultType = watcherConfig.defaultType;
            const watchPathRoot = upath.normalize(watcherConfig.path);
            const watchPaths = watcherConfig.extensions.map(ext => {
                return upath.join(watchPathRoot, "*." + ext)
            });
            const watcher = chokidar.watch(watchPaths, {
                ignored: /^\.|Output|Error|Archive|Processed/, 
                depth: 0
            })
            .on("add", path => {
                this.processImageAtPath(path, watchDefaultType);
            });

            console.log(`Watcher set for ${watchPaths.toString()}`);
            this.watchers.push(watcher);
        }
        this._state = ServerState.RUNNING;
    }
    pause()
    {
        console.log(`Server paused.`);
        this._state = ServerState.PAUSED;
    }
    stop()
    {
        console.log(`Server stopped.`);
        this.watchers.forEach(watcher => {
            watcher.removeAllListeners();
            watcher.close();
        });
        this._state = ServerState.STOPPED;
    }
    close() 
    {
        console.log(`Server closing...`);
        this.stop();
        this.server && this.server.close(() => {
            console.log(`Server closed.`);
        });
    }
    pauseCheck(doPause)
    {
        if(doPause || this._state == ServerState.PAUSED) 
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
     * Manually shove an image into a pipeline
     * @param {string|object} json what would ordinarily be read from a json file
     */
    async processImageWithJson(json)
    {
        const reader = new Image.Reader();
              reader.readProcessingDataFromJson(json);
        const image = reader.getImage();
        this.pushToPipeline(image);
    }
    /**
     * Read metadata, and notify CEP pipeline image is ready for processing 
     */
    async processImageAtPath(path, defaultType)
    {
        path = upath.normalize(path);
        const imageName = upath.basename(path);
        const reader = new Image.Reader(path, { type: defaultType });
        console.log(`Processing: ${imageName} Full Path: ${path} Default Type: ${defaultType}`);

        try {
            await reader.readProcessingData();
            await reader.readMetadata();
        } catch(e) {
            const image = reader.getImage();
            this.moveImageToErrored(image, e.toString());
            return;
        }

        // TODO: Allow Server to run independent of CEP Panel process? Communicate via IPC?
        //      Node code would run in Server process and JSX would run in CEP Panel process.
        const image = reader.getImage();
        this.pushToPipeline(image);
    }
    pushToPipeline(image)
    {
        this.pipelineQueue.push(image);
        if(!this._isPipelinesRunningMutex) {
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
        this._isPipelinesRunningMutex = true; // mutex
        let image = null;

        await this.runJsx(`app.displayDialogs = DialogModes.NO;`);
        while(image = this.pipelineQueue.pop())
        {
            const pipelines = this.pipelines[image.type.toLowerCase()];
            if(!pipelines) {
                console.error(`Pipeline not found for image: ${image.imagePath} type: ${image.type}`);
                continue;
            }

            try 
            {
                await this.runPipelineImageStart(image);

                for(const pipeline of pipelines) 
                {
                    if(pipeline.disabled) continue;
                    this.emit("pipelinestart", image.type);
                    
                    // Run Actions
                    for(const jsxAction of pipeline.externalActions) 
                    {
                        this.emit("action", jsxAction.action);
                        // Call jsx action by name with config parameters 
                        let result = await this.runAction(jsxAction.action, jsxAction.parameters);

                        await this.pauseCheck(this.config.pauseAfterEveryAction);
                        if(result === "EXIT") break;
                        if(this.isStopped()) break;
                    }
                    await this.runJsx(`closeAll();`);
                    await this.pauseCheck(this.config.pauseAfterEveryPipeline);
                    if(this.isStopped()) break;
                }
                    
                this.moveImageToProcessed(image);
                console.log("Pipeline completed for image: " + image.imageName);
            }
            catch(e) 
            {
                await this.pauseCheck(this.config.pauseOnExceptions);
                this.moveImageToErrored(image, e.toString());
            }
            finally 
            {
                this.emit("pipelineend", image.type);
                await this.runPipelineImageEnd(image);
                await this.pauseCheck(this.config.pauseAfterEveryImage);
                if(this.isStopped()) break;
            }
        }
        await this.runJsx(`closeAll(); $.gc();`);
        this.updateMemoryStats();
        this._isPipelinesRunningMutex = false;
        console.log("Pipeline queue finished.");
    }
    /**
     * Reads all jsx files in the given directory recursively, and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @param {string} pathToActions the current path to the jsx action files
     * @param {string} defaultNamespace The default namespace for actions in the root path 
     */
    loadActionPaths(pathToActions, defaultNamespace)
    {
        return this.loadActionPath(pathToActions, "", defaultNamespace); 
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
     * @param {string} actionParameters the jsx action function parameters, either a primitive or object
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
