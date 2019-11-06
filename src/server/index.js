
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
import classifiers from '../classifiers';
import _ from '../utils';

const ServerState = {
    STOPPED: 0, 
    PAUSED: 1,
    RUNNING: 2
};
const port = 3001;
const app = express();

/**
 * Server is not CEP panel aware
 * Features:
 *  - Dead simple REST api
 *  - Directory watching for image files to process 
 *  - Configurable watchers, classifiers, and pipelines
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
        // Images waiting for processing
        this.pipelineQueue = [];

        this.cs = new CSInterface();     
        this._isPipelineRunningMutex = false;
        this._serverState = ServerState.STOPPED;
    }
    _loadConfiguration() 
    {
        this.configurator = new ServerConfiguration();
        this.config = this.configurator.load(this.configPath);
        if(!this.config.watchers) {
            throw new Error("Server config missing 'watchers'.");
        }
    }
    _loadPipelineConfiguration()
    {
        this.pipelineConfigurator = new ServerConfiguration();
        this.pipelineConfig = this.pipelineConfigurator.load(this.pipelineConfigPath);
        if(!this.pipelineConfig.pipelines) {
            throw new Error("Server pipeline config missing 'pipelines'.");
        }
    }
    getConfiguration() {
        return this.configurator.clone();
    }
    getPipelineConfiguration() {
        return this.pipelineConfigurator.clone();
    }
    setConfiguration(key, value)
    {
        // TODO changes to pipeline options don't require server restart?
        this.configurator.set(key, value);
        console.log(`Server config ${key} changed to ${value}`);
    }
    setPipelineConfiguration(key, value)
    {
        this.pipelineConfigurator.set(key, value);
    }
    isPaused() {
        return this._state == ServerState.PAUSED;
    }
    isStopped() {
        return this._state == ServerState.STOPPED;
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
        //-----------------
        // Load config
        //-----------------
        this._loadConfiguration();
        console.log("Loaded server config: ");
        console.dir(this.config);

        //-----------------
        // Load Pipelines 
        //-----------------
        this._loadPipelineConfiguration();
        for(const pipeline of this.pipelineConfig.pipelines)
        {
            this.pipelines[pipeline.for.toLowerCase()] = pipeline;
        }

        //-----------------
        // Load Actions 
        //-----------------
        let actionScript = "action={};";
            actionScript += this.loadActionPath(this.actionPath, "");
        let loadActionsResult = await this.runAction(actionScript);
        console.log("Loaded actions.");

        this.emit("init");
    }
    async start()
    {
        if (this._state == ServerState.STOPPED) 
        {
            //-----------------
            // Setup watchers 
            //-----------------
            for(const watcherConfig of this.config.watchers) 
            {
                const watchPathRoot = upath.normalize(watcherConfig.path);
                const watchPaths = watcherConfig.extensions.map(ext => upath.join(watchPathRoot, "**", "*." + ext));
                const watcher = chokidar.watch(watchPaths, {
                    ignored: /^\.|Output|Error/
                })
                .on("add", this.processImage.bind(this))
                .on("addDir", this.processImage.bind(this));

                console.log(`Watcher set for ${watchPaths.toString()}`);
                this.watchers.push(watcher);
            }

            //-----------------
            // Setup routes
            //-----------------
            app.get('/activedocument', (req, res) => {
                this.cs.evalScript("_.getDocumentPath()", function(activeDocumentPath) {
                    res.send("Success! Active Document: " + activeDocumentPath);
                });
            });
            app.get('/search', (req, res) => {
                // search for files matching parameters 
                res.status(200).send("Search results are thus...");
            });
            app.post('/process', (req, res) => {
                // stream image file or zip to processing directory
                // stream json data to file in processing directory
                // process
                res.status(201).json({ success: true })
            });
            app.use(function(req, res, next) {
                res.status(404).send("Sorry, can't find that!");
            });
            app.use(function (err, req, res, next) {
                console.error(err.stack)
                res.status(500).send('Something broke!')
            });

            //-----------------
            // Start server
            //-----------------
            this.server = app.listen(port, function() {
                console.log(`Express is listening to http://localhost:${port}`);
            });
        }
        this._state = ServerState.RUNNING;
    }
    pause()
    {
        this._state = ServerState.PAUSED;
    }
    close() 
    {
        console.log("Server closing...");
        this.watchers.forEach(watcher => watcher.close());
        this.server && this.server.close(() => {
            console.log("Server closed.");
        });
        this._state = ServerState.STOPPED;
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
     * Run classifiers, read metadata, and notify CEP pipeline image is ready for processing 
     */
    async processImage(imagePath)
    {
        imagePath = upath.normalize(imagePath);
        const imageName = upath.basename(imagePath);
        const reader = new Image.Reader(imagePath, imageName);
        console.log("Processing: " + imageName + " Full Path: " + imagePath);

        try {
            await Promise.all([
                reader.readProcessingData(),
                reader.readMetadata()
            ]);    
        } catch(e) {
            const image = reader.getImage();
            this.moveToErrored(image, e.toString());
            return;
        }

        // TODO: Allow Server to run independent of CEP Panel? Communicate via IPC?
        //      Node code would run in Server process and JSX would run in CEP Panel process.
        const image = reader.getImage();
        this.pushToPipeline(image);
    }
    pushToPipeline(image)
    {
        this.pipelineQueue.push(image);
        if(!this._isPipelineRunningMutex) {
            this.runPipeline();
        }
    }
    async moveToErrored(image, message)
    {
        const sourceDir = upath.dirname(image.path);
        const destDir = upath.join(sourceDir, "Error_" + image.type);
        const destLogsPath = upath.join(destDir, image.fileName + ".log");
        const destImagePath = upath.join(destDir, image.fileName);
        await new Promise(resolve => {
            fs.mkdir(destDir, {
                recursive: false
            }, err => {
                if(err) throw err;
                resolve();
            });
        });
        fs.writeFile(destLogsPath, message, err => {
            if(err) 
                console.error(err + "\nErrored image logs could not be written to " + destLogsPath);
        });
        fs.rename(image.path, destImagePath, err => {
            if(err) {
                console.error(err + "\nErrored image could not be moved to " + destImagePath);
                return;
            }
            console.log("Errored image moved to: " + destImagePath);
        });
        if(!image.dataFilePath || !image.dataFileName) {
            return;
        }
        const destDataPath = upath.join(destDir, image.dataFileName);
        fs.rename(image.dataFilePath, destDataPath, err => {
            if(err) 
                console.error(err + "\nErrored image data could not be moved to " + destDataPath);
        });
    }
    async moveTo(image, toDirectory)
    {

    }
    /**
     * Run images through pipeline per its configuration
     * Only one image may run through the Photoshop at one time
     */
    async runPipeline()
    {
        this._isPipelineRunningMutex = true; // mutex
        let image = null;

        await this.runAction(`__PIPELINE = {};`);
        while(image = this.pipelineQueue.pop())
        {
            // TODO: Allow multiple pipelines for a given type
            const pipeline = this.pipelines[image.type];
            if(!pipeline) {
                console.error("Pipeline not found for image: " + image.path + " type: " + image.type);
                continue;
            }

            try 
            {
                this.emit("pipelinestart", image.type);

                // Open document 
                await this.runAction(`IMAGE=new ImageForProcessing(${JSON.stringify(image)});`);
                await this.runAction(`
                    closeAll(); 
                    __PIPELINE.restoreUnits = _.saveUnits(); 
                    openAsActive('${image.path}');`);

                // Run Actions
                for(const photoshopActionConfig of pipeline.externalActions) 
                {
                    const psAction = photoshopActionConfig.action;
                    const psActionParameters = JSON.stringify(photoshopActionConfig.parameters);
                    const jsxString = `(function(){
                    try {
                        var result = ${psAction}(${psActionParameters});
                        return result;
                    } catch(e) {
                        alert("Cannot run action: ${psAction} Exception: " + e); 
                        return "Exception: " + e.toString();
                    }
                    }());`;

                    this.emit("action", psAction);
                    // Call jsx action by name with config parameters 
                    await this.runAction(jsxString)
                    await this.pauseCheck(this.config.pauseAfterEveryAction);
                    if(this._state == ServerState.STOPPED) {
                        break;
                    }
                }
            }
            catch(e) 
            {
                await this.pauseCheck(this.config.pauseOnExceptions);
                this.moveToErrored(image, e.toString());
            }
            finally 
            {
                this.emit("pipelineend", image.type);
                await this.runAction(`__PIPELINE.restoreUnits && __PIPELINE.restoreUnits();`);
                await this.pauseCheck(this.config.pauseAfterEveryImage);
                if(this._state == ServerState.STOPPED) {
                    break;
                }
            }
            
            console.log("Pipeline completed for image: " + image.fileName);
        }
        this._isPipelineRunningMutex = false;
        console.log("Pipeline queue finished.");
    }
    /**
     * Reads all jsx file paths in the given directory recursively, and builds an import JSX string for execution.
     * Each new directory encountered becomes a nested namespace.
     * @param {string} pathToActions the current path to the jsx action files
     * @param {string} namespace the current action namespace (e.g.  product)
     */
    loadActionPath(pathToActions, namespace)
    {
        let namespacePrefix = `${namespace}.`;
        let namespaceDefine = `${namespace}={};`;
        if(!namespace) {
            namespacePrefix = "";
            namespaceDefine = "";
        }
        
        return fs.readdirSync(pathToActions)
            .reduce((script, name) => 
            {
                let nextPath = upath.join(pathToActions, name);
                let nextScript;
                if(fs.statSync(nextPath).isDirectory()) {
                    nextScript = this.loadActionPath(nextPath, `${namespacePrefix}${name}`);
                } else {
                    nextScript = `importAction("${nextPath}");`
                }
                return script + nextScript;
            }, 
            namespaceDefine);
    }
    /**
     * Note that evalScript runs asynchronously, but Photoshop runs the code synchronously
     * @param {string} actionString the jsx code string
     */
    runAction(actionString)
    {
        return new Promise((resolve, reject) => 
        {
            this.cs.evalScript(actionString, function(result) 
            {
                if(result.toLowerCase().includes("error") || result.toLowerCase().includes("exception")) {
                    const errorMessage = `Action: \n\t${actionString}\nResult:\n${result}`;
                    console.error(errorMessage);
                    reject(errorMessage);
                } else {
                    console.log(`Action: \n\t${actionString}\nResult: ${result}`);
                    resolve()
                }
            });
        })
    }
}
