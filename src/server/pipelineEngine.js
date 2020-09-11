import EventEmitter from "events";
import _ from '../utils';
import store from '../store';
import host from '../host';
import Image from './image';
import ImageFileMover from './imageFileMover';
import ImageFileReader from './imageFileReader';
import ImageFileProducer from './imageFileProducer';
import ImageSourceType from './imageSourceType';
import PipelineEngineState from './pipelineEngineState';

export class PipelineEngine extends EventEmitter
{
    constructor() 
    {
        super();
        this._processingMutex = false; 
        this._state = PipelineEngineState.STOPPED;

        /**
         * Produder Id => [Pipeline Names...]
         */
        this._producerIdToPipelines = new Map();
        /**
         * Producer Id => ImageFileProducer instance
         */
        this._producerIdToProducer = new Map();
        this._producerIdsWhichDepleted = [];

        /**
         * With objects of form 
         * {
         *      producerId: id of the ImageFileProducer which emitted the file path
         *      file: the path of the file
         * }
         */
        this._imageFileQ = [];
        this._imageFileReader = new ImageFileReader();
        this._imageFileMover = new ImageFileMover();
    }
    /**
     * @returns {Promise}
     */
    init() 
    {
        return Promise.resolve();
    }
    destroy()
    {
        // stop any processing
        // destroy all producers
        this._destroyAllProducers();
        this.state = PipelineEngineState.STOPPED;
    }
    _destroyDepletedProducers()
    {
        this._destroyProducers(this._producerIdsWhichDepleted);
        this._producerIdsWhichDepleted = [];
    }
    _destroyAllProducers()
    {
        const producerIds = [...this._producerIdToProducer.keys()];
        this._destroyProducers(producerIds);
    }
    _destroyProducers(producerIds)
    {
        producerIds = producerIds.filter(id => this._producerIdToProducer.has(id));
        for(const producerId of producerIds) 
        {
            this._producerIdToProducer.get(producerId).destroy();
            this._producerIdToProducer.delete(producerId);
            this._producerIdToPipelines.delete(producerId);

            console.log(`Image File Producer ${producerId} destroyed.`);
        }
    }
    _addFileProducer(producer, pipelineNames) 
    {
        this._producerIdToPipelines.set(producer.id, pipelineNames);
        this._producerIdToProducer.set(producer.id, producer);

        producer.on("files", this._onProducerFile.bind(this));
        producer.on("depleted", this._onProducerDepleted.bind(this));
        producer.produce();

        console.log(`Image File Producer ${producer.id} added.`);
    }
    /**
     * Run the given pipeline with files from the given source
     * @param {string} pipelineName pipeline name
     * @param {ImageSourceType} sourceType FILEWATCHER, DIRECTORY, or OPENFILES
     * @param {string} sourcePath if sourceType is DIRECTORY
     * @param {string} sourceExtensions if sourceType is DIRECTORY
     */
    run(pipelineName, sourceType, sourcePath, sourceExtensions)
    {
        this._run([pipelineName], sourceType, sourcePath, sourceExtensions);
    }
    /**
     * Run all pipelines with files from the given source
     * @param {ImageSourceType} sourceType FILEWATCHER, DIRECTORY, OPENFILES, or BLANK
     * @param {string} sourcePath if sourceType is DIRECTORY
     * @param {string} sourceExtensions if sourceType is DIRECTORY
     */
    runAll(sourceType, sourcePath, sourceExtensions)
    {
        this._run(
            store.pipelines.pipelines.map(p => p.name), 
            sourceType, 
            sourcePath, 
            sourceExtensions
        );
    }
    _run(pipelineNames, sourceType, sourcePath, sourceExtensions) 
    {
        if(!this.isStopped()) {
            console.log("Pipeline engine is already running.");
            return;
        }
        console.log(`Running pipelines: "${pipelineNames.join(",")}" with source: ${ImageSourceType.toKey(sourceType)}`);

        this.state = PipelineEngineState.IDLE;
        switch(sourceType)
        {
            case ImageSourceType.FILEWATCHER: 
                this._runWithFileWatchers(pipelineNames); break;
            case ImageSourceType.DIRECTORY: 
                this._runWithDirectory(pipelineNames, sourcePath, sourceExtensions); break;
            case ImageSourceType.OPENFILES: 
                this._runWithOpenFiles(pipelineNames); break;
            case ImageSourceType.BLANK:
                this._runWithBlank(pipelineNames); break;
            case ImageSourceType.ACTIVEDOCUMENT: 
                this._runWithActiveDocument(pipelineNames); break;
            default: 
                console.log(`ImageSourceType ${sourceType} not recognized.`);
                this.state = PipelineEngineState.STOPPED;
        }
    }
    _runWithFileWatchers(pipelineNames)
    {
        // Get all unique file watchers for given pipelines
        let watcherNames = pipelineNames.reduce((arr, name) => {
            const pipeline = this._getConfigurationByPipelineName(name);
            return arr.concat(pipeline.watcherNames);
        }, []);
        watcherNames = _.unique(watcherNames); 

        // IMPORTANT: We Do Not want multiple producers for the same files
        // Which would happen if we looped by each pipeline and created its producers
        // since there is a many-to-one relationship between pipelines and file watchers
        for(const watcherName of watcherNames) 
        {
            const fileWatcher = this._getFileWatcherByName(watcherName);
            if(!fileWatcher) {
                console.warn(`File watcher ${watcherName} not found.`);
                continue;
            }
            const pipelineNames = this._getConfigurationsByFileWatcherName(watcherName).map(p => p.name);
            const producer = ImageFileProducer.withFileWatcher(
                fileWatcher.path, 
                fileWatcher.extensions,
                fileWatcher.outputDirectory,
                fileWatcher.processedDirectory
            );
            this._addFileProducer(producer, pipelineNames);
        }
    }
    _runWithDirectory(pipelineNames, directory, extensions) 
    {
        const producer = ImageFileProducer.withDirectory(directory, extensions);
        this._addFileProducer(producer, pipelineNames);
    }
    _runWithOpenFiles(pipelineNames) 
    {
        const producer = ImageFileProducer.withOpenFiles();
        this._addFileProducer(producer, pipelineNames);
    }
    _runWithBlank(pipelineNames) 
    {
        const producer = ImageFileProducer.withBlank();
        this._addFileProducer(producer, pipelineNames);
    }
    _runWithActiveDocument(pipelineNames) 
    {
        const producer = ImageFileProducer.withActiveDocument();
        this._addFileProducer(producer, pipelineNames);
    }
    pause() {
        if(this.isProcessing()) {
            this.state = PipelineEngineState.PAUSED;
        }
    }
    resume() {
        if(this.isPaused()) {
            this.state = PipelineEngineState.PROCESSING;
        }
    }
    stop() {
        this._destroyAllProducers();
        this.state = PipelineEngineState.STOPPED;
    }
    _stopIfNoProducers()
    {
        if(this._producerIdToProducer.size === 0) {
            this.state = PipelineEngineState.STOPPED;
        }
    }


    _getProducerById(producerId)
    {
        return this._producerIdToProducer.get(producerId);
    }
    _getFileWatcherByName(watcherName)
    {
        return store.general.fileWatchers.find(w => w.name === watcherName);
    }
    _getConfigurationsByPipelineNames(pipelineNames)
    {
        return store.pipelines.pipelines.filter(p => pipelineNames.includes(p.name));
    }
    _getConfigurationByPipelineName(pipelineName) 
    {
        return store.pipelines.pipelines.find(p => p.name === pipelineName);
    }
    _getConfigurationsByProducerId(producerId) 
    {
        const pipelineNames = this._producerIdToPipelines.get(producerId);
        return store.pipelines.pipelines.filter(p => pipelineNames.includes(p.name));
    }
    _getConfigurationsByFileWatcherName(watcherName) 
    {
        return store.pipelines.pipelines.filter(p => p.watcherNames.includes(watcherName));
    }
    _onProducerFile(producerId, files) 
    {
        console.log("File produced.");
        const qFiles = files.map(file => { 
            return {
                producerId,
                file
            }
        });
        this._imageFileQ = this._imageFileQ.concat(qFiles);
        this._process();
    }
    _onProducerDepleted(producerId) 
    {
        this._producerIdsWhichDepleted.push(producerId);
    }
    _process()
    {
        if(this._processingMutex) return;
        this._processingMutex = true;
        this.state = PipelineEngineState.PROCESSING;
        console.log(`Pipeline process loop started with ${this._imageFileQ.length} images.`);
 
        this._runWaitOneFrame()
        .then(this._runProcessStart.bind(this))
        .then(this._runProcessLoop.bind(this))
        .then(this._runProcessEnd.bind(this))
        .then(() => {
            this.state = PipelineEngineState.IDLE;
            this._destroyDepletedProducers();
            this._stopIfNoProducers();
            this._processingMutex = false;
            console.log("Pipeline process loop exited.");
        });
    }
    _runWaitOneFrame()
    {
        return new Promise(resolve => { setTimeout(resolve, 0); });
    }
    _runProcessStart()
    {
        return host.runJsxWithThrow(`app.displayDialogs = DialogModes.NO;`);
    }
    async _runProcessLoop()
    {
        let qFile;
        while(qFile = this._imageFileQ.pop()) 
        {
            const { file, producerId } = qFile;
            console.log(`Reading next file ${file} from producer ${producerId}.`);

            // Note: image 'pipelines' property takes precedence over pipelines listed for producer
            const imageSource = this._getProducerById(producerId).getImageSource();
            const image = await this._imageFileReader.read(file, imageSource.outputDirectory, imageSource.processedDirectory, store.general.doReadFileMetadata);
            const pipelines = image.pipelines ? this._getConfigurationsByPipelineNames(image.pipelines) : this._getConfigurationsByProducerId(producerId);
            console.log(`Processing image: ${image.inputImagePath}`);

            try 
            {
                // For each Pipeline configuration
                for(const pipeline of pipelines) 
                {
                    if(pipeline.disabled) {
                        console.log(`Skipping disabled pipeline '${pipeline.name}'`);
                        continue;
                    }

                    await this._runPipelineStart(image, pipeline);
    
                    // For each action function
                    for(const action of pipeline.actions) 
                    {
                        this.emit("action", action.actionName);
                        let result = await host.runActionWithParameters(action.actionName, action.parameters);
                        this.emit("actionend", action.actionName);

                        if(this._stopCheck(result)) break;
                        await this._pauseCheck(result, store.general.pauseAfterEveryAction);
                    }

                    await this._runPipelineEnd(pipeline);
    
                    if(this._stopCheck()) break;
                    await this._pauseCheck(null, store.general.pauseAfterEveryPipeline);
                }

                // TODO Utilize "useProcessedDirectory" and "useOutputDirectory" options
                this._imageFileMover.move(image, image.processedDirectory || "./Processed");
            }
            catch(e)
            {
                console.error(e);
                await this._pauseCheck(null, store.general.pauseOnExceptions);
                this._imageFileMover.move(image, (image.processedDirectory || "") + "./Errored", e.toString());
            }
            finally
            {
                await this._pauseCheck(null, store.general.pauseAfterEveryImage);
                if(this._stopCheck()) break;
            }
        }
    }
    _runProcessEnd()
    {
        return host.runJsxWithThrow(`$.gc();`);
    }
    /**
     * Close all documents. Save Photoshop settings. Instantiate IMAGE instance.
     * @param {Image} image 
     * @param {object} pipeline the pipeline configuration object
     * @returns {Promise}
     */
    _runPipelineStart(image, pipeline)
    {
        console.log(`Pipeline '${pipeline.name}' started.`);
        this.emit("pipelinestart", pipeline.name);
        return host.runJsxWithThrow(`
        __PIPELINE = {
            restoreUnits: _.saveUnits()
        };
        IMAGE = new ImageForProcessing(${JSON.stringify(image)});`);
    }
    /**
     * Restore Photoshop settings. Clear IMAGE Instance.
     * @param {object} pipeline the pipeline configuration object 
     * @returns {Promise}
     */
    _runPipelineEnd(pipeline)
    {
        console.log(`Pipeline '${pipeline.name}' ended.`);
        this.emit("pipelineend", pipeline.name);
        return host.runJsxWithThrow(`
        __PIPELINE.restoreUnits && __PIPELINE.restoreUnits(); 
        IMAGE=null;
        `);
    }
    _stopCheck(actionResult) 
    {
        if(this.isStopped() || actionResult === "STOP") {
            this.state = PipelineEngineState.STOPPED;
            return true;
        }
        if(actionResult === "EXIT") {
            this.state = PipelineEngineState.IDLE;
            return true;
        }
        return false;
    }
    _pauseCheck(actionResult, forcePause) 
    {
        if(this.isPaused() || forcePause || actionResult === "PAUSE") 
        {
            console.log("Pipeline Engine waiting on pause...");
            this.state = PipelineEngineState.PAUSED;

            return new Promise(resolve => {
                this.once("state", state => {
                    if(state != PipelineEngineState.PAUSED) {
                        resolve();
                    }
                });
            });
        } else {
            return Promise.resolve();
        }
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        this.emit("state", value);
    }
    isIdle() { return this.state === PipelineEngineState.IDLE; }
    isStopped() { return this.state === PipelineEngineState.STOPPED; }
    isPaused() { return this.state === PipelineEngineState.PAUSED; }
    isProcessing() { return this.state === PipelineEngineState.PROCESSING; }
}