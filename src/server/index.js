/* npm modules */
import upath from 'upath';
import fs from 'fs';
import chokidar from 'chokidar';
import debounce from 'debounce'; 
import express from 'express';

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
    constructor(serverPath) 
    {
        this.server = null;
        this.configPath = upath.join(serverPath, "config.json");
        this.config = {};
        this.watchers = [];
        this.pipelines = {};
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

        if(!this.config.root) {
            throw new Error("Server config missing 'root' watch path.");
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
        this.pipelines = this.config.pipelines;

        // TODO: Communicate (IPC?) with CEP to setup pipelines
        // On new image to process, serialize Image instance to be processed by pipeline 

        //-----------------
        // Setup watchers 
        //-----------------
        for(const watcherConfig of this.config.watchers) 
        {
            const watchPathRoot = upath.join(this.config.root, watcherConfig.target);
            const watchPaths = watcherConfig.extensions.map(ext => upath.join(watchPathRoot, "**", "*." + ext));
            const watcher = chokidar.watch(watchPaths, {
                ignored: /^\./
            })
            .on("add", this.processImage)
            .on("addDir", this.processImage);

            console.log(`Watcher set for ${watchPaths.toString()}`);
            this.watchers.push(watcher);
        }

        //-----------------
        // Setup routes
        //-----------------
        app.get('/activedocument', (req, res) => {
            new CSInterface().evalScript("_.getActiveDocumentPath()", function(activeDocumentPath) {
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
    processImage(imagePath)
    {
        imagePath = upath.normalize(imagePath);
        const basename = upath.basename(imagePath);
        const reader = new Image.Reader(imagePath, basename);
        Promise.all([
            reader.readMetadata(),
            reader.readWithClassifiers(classifiers)
        ])
        .then(() => {
            const image = reader.getImage();
            console.log("Image ready for pipeline: ");
            console.dir(image);
            // find pipeline 
            const pipeline = this.pipelines[image.type];
            // run pipeline actions 
            this.notifyPipeline(image);
        });

        console.log("Processing: " + basename + " Full Path: " + imagePath);
    }
    notifyPipeline(image)
    {
        // Communicate with CEP side to run image through pipeline
        
    }
}
