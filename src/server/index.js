/* npm modules */
import upath from 'upath';
import fs from 'fs';
import chokidar from 'chokidar';
import debounce from 'debounce'; 
import express from 'express';
import promisify from 'es6-promisify';

/* local modules */
import Image from './image';
import classifiers from '../classifiers';

const port = 3001;
const app = express();

/**
 * Server is not CEP panel aware
 * Features:
 *  - Dead simple REST api
 *  - Directory watching for image files to process 
 *  - Configurable watchers, classifiers, and pipelines
 */
export default class Server
{
    constructor(serverPath, actionPath) 
    {
        this.server = null;
        this.actionPath = actionPath;
        this.configPath = upath.join(serverPath, "config.json");
        this.config = {};
        this.watchers = [];
        this.pipelines = {};
        this.cs = new CSInterface();
        this.pipelineQueue = [];
        this.isPipelineRunning = false;
    }
    close() 
    {
        console.log("Server closing...");
        this.watchers.forEach(watcher => watcher.close());
        this.server && this.server.close(function() {
            console.log("Server closed.");
        });
    }
    loadConfiguration() 
    {
        let rawconfig = fs.readFileSync(this.configPath);
        this.config = JSON.parse(rawconfig);

        if(!this.config.watchRoot) {
            throw new Error("Server config missing 'watchRoot' watch path.");
        }
        if(!this.config.watchers) {
            throw new Error("Server config missing 'watchers'.");
        }
        if(!this.config.pipelines) {
            throw new Error("Server config missing 'pipelines'.");
        }
    }
    init() 
    {
        //-----------------
        // Load config
        //-----------------
        this.loadConfiguration();
        console.log("Loaded server config: ");
        console.dir(this.config);

        //-----------------
        // Load Pipelines 
        //-----------------
        for(const pipelineConfig of this.config.pipelines)
        {
            this.pipelines[pipelineConfig.for] = pipelineConfig;
        }

        //-----------------
        // Setup watchers 
        //-----------------
        for(const watcherConfig of this.config.watchers) 
        {
            const watchPathRoot = upath.join(this.config.watchRoot, watcherConfig.target);
            const watchPaths = watcherConfig.extensions.map(ext => upath.join(watchPathRoot, "**", "*." + ext));
            const watcher = chokidar.watch(watchPaths, {
                ignored: /^\./
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
            // download file if not local? 
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
    /**
     * Run classifiers, read metadata, and notify CEP pipeline image is ready for processing 
     */
    async processImage(imagePath)
    {
        imagePath = upath.normalize(imagePath);
        const imageName = upath.basename(imagePath);
        const reader = new Image.Reader(imagePath, imageName);
        console.log("Processing: " + imageName + " Full Path: " + imagePath);

        await Promise.all([
            reader.readMetadata(),
            reader.readWithClassifiers(classifiers)
        ]);
        
        // TODO: Allow Server to run independent of CEP Panel? Communicate via IPC?
        //      Node code would run in Server process and JSX would run in CEP Panel process.
        const image = reader.getImage();
        this.pushToPipeline(image);
    }
    pushToPipeline(image)
    {
        this.pipelineQueue.push(image);
        if(!this.isPipelineRunning) {
            this.runPipeline();
        }
    }
    /**
     * Run images through pipeline per its configuration
     * Only one image may run through the Photoshop at one time
     */
    async runPipeline()
    {
        this.isPipelineRunning = true; // mutex
        let image = null;
        while(image = this.pipelineQueue.pop())
        {
            const pipeline = this.pipelines[image.type];
            if(!pipeline) {
                console.error("Pipeline not found for image: " + image.path + " type: " + image.type);
            }
            // Open document 
            await this.runAction(`IMAGE=${JSON.stringify(image)};`);
            await this.runAction(`closeAll(); openAsActive('${image.path}');`);
            // Run Actions
            for(const photoshopActionConfig of pipeline.externalActions) 
            {
                const psAction = photoshopActionConfig.action;
                const psActionPath = upath.join(this.actionPath, psAction + ".jsx");
                const psActionParameters = JSON.stringify(photoshopActionConfig.parameters);
                const jsxString = `runAction('${psActionPath}','${psAction}', ${psActionParameters})`;
                
                // call jsx file by action name with config parameters 
                await this.runAction(jsxString)
            }
            // Run Server Actions
            // move/delete/rename files... ?

            console.log("Pipeline completed for image: " + image.fileName);
        }
        this.isPipelineRunning = false;
        console.log("Pipeline queue finished.");
    }
    /**
     * Note that evalScript runs asynchronously, but Photoshop runs the code synchronously
     * @param {string} actionString the jsx code string
     */
    runAction(actionString)
    {
        return new Promise((resolve, reject) => 
        {
            this.cs.evalScript(actionString, function(result) {
                if(result.includes("error")) {
                    reject(`Action: \n\t${actionString}\n\tResulted in Error.`);
                }
                resolve(`Action: \n\t${actionString}\n\tResult: ${result}`)
            });
        })
    }
}
