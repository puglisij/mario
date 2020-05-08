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
         * Map values are an array containing pipeline names
         */
        this._producerIdToPipelines = new Map();
        /**
         * ImageFileProducer instances
         */
        this._producers = [];

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
        this._destroyProducers();
        this.state = PipelineEngineState.STOPPED;
    }
    _destroyProducers()
    {
        const producerIds = this._producers.map(p => p.id);
        for(const producerId of producerIds) {
            this._destroyFileProducer(producerId);
        }
    }
    _destroyFileProducer(producerId)
    {
        this._producerIdToPipelines.get(producerId).destroy();
        this._producerIdToPipelines.delete(producerId);
        this._producers = this._producers.filter(p => p.id !== producerId);
    }
    _addFileProducer(producer, pipelineNames) 
    {
        this._producerIdToPipelines.set(producer.id, pipelineNames);
        this._producers.push(producer);

        producer.on("files", this._onProducerFile);
        producer.on("depleted", this._onProducerDepleted);
        producer.produce();

        console.log("Image File Producer added.");
    }
    /**
     * Run the given pipeline with files from the given source
     * @param {string} pipelineName pipeline name
     * @param {string} sourceType FILEWATCHER, DIRECTORY, or OPENFILES
     * @param {string} sourcePath if sourceType is DIRECTORY
     * @param {string} sourceExtensions if sourceType is DIRECTORY
     */
    run(pipelineName, sourceType, sourcePath, sourceExtensions)
    {
        this._run([pipelineName], sourceType, sourcePath, sourceExtensions);
    }
    /**
     * Run all pipelines with files from the given source
     * @param {string} sourceType FILEWATCHER, DIRECTORY, OPENFILES, or BLANK
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

        let type = ImageSourceType.parse(sourceType);
        switch(type)
        {
            case ImageSourceType.FILEWATCHER: 
                this._runWithFileWatchers(pipelineNames); break;
            case ImageSourceType.DIRECTORY: 
                this._runWithDirectory(pipelineNames, sourcePath, sourceExtensions); break;
            case ImageSourceType.OPENFILES: 
                this._runWithOpenFiles(pipelineNames); break;
        }
        this.state = PipelineEngineState.IDLE;
    }
    _runWithFileWatchers(pipelineNames)
    {
        // Get all file watchers for given pipelines
        const watcherNames = pipelineNames.reduce((arr, name) => {
            const pipeline = this._getConfigurationByPipelineName(name);
            return arr.concat(pipeline.watcherNames);
        }, []);
        // IMPORTANT: We Do Not want multiple producers for the same files
        // Which would happen if we looped by pipeline and created its producers
        // since there is a many-to-one relationship between pipelines and file watchers
        for(const watcherName of watcherNames) 
        {
            const fileWatcher = this._getFileWatcherByName(watcherName);
            const pipelineNames = this._getConfigurationsByFileWatcherName(watcherName).map(p => p.name);
            const producer = ImageFileProducer.withFileWatcher(
                fileWatcher.path, 
                fileWatcher.extensions
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
        this._destroyProducers();
        this.state = PipelineEngineState.STOPPED;
    }
    _stopIfNoProducers()
    {
        if(this._producers.length === 0) {
            this.state = PipelineEngineState.STOPPED;
        }
    }


    _getFileWatcherByName(watcherName)
    {
        return store.general.fileWatchers.find(w => w.name === watcherName);
    }
    _getFileWatchersByPipelineName(pipelineName)
    {
        const pipeline = this._getConfigurationByPipelineName(pipelineName);
        return store.general.fileWatchers.filter(w => pipeline.watcherNames.includes(w.name));
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
        const qFiles = files.map(file => { 
            file,
            producerId
        });
        this._imageFileQ = this._imageFileQ.concat(qFiles);
        this._process();
    }
    _onProducerDepleted(producerId) 
    {
        this._destroyFileProducer(producerId);
        this._stopIfNoProducers();
    }
    async _process()
    {
        if(this._processingMutex) return;
        this._processingMutex = true;
        this.state = PipelineEngineState.PROCESSING;
        console.log("Pipeline process loop started.");

        // Pump Image instances through Pipelines
        await this._runProcessStart();
        
        let qFile;
        while(qFile = this._imageFileQ.pop()) 
        {
            const { file, producerId } = qFile;
            const image = await this._imageFileReader.read(file);
            const pipelines = this._getConfigurationsByProducerId(producerId);

            try 
            {
                // For each Pipeline configuration
                for(const pipeline of pipelines) 
                {
                    if(pipeline.disabled) {
                        console.log(`Skipping disabled pipeline ${pipeline.name}`);
                        continue;
                    }
    
                    console.log(`Pipeline ${pipeline.name} started for image: ${image.imageInputSource}`);
                    this.emit("pipelinestart", pipeline.name);
                    await this._runPipelineStart(image);
    
                    // For each action function
                    for(const action of pipeline.actions) 
                    {
                        this.emit("action", action.actionName);
                        let result = await host.runActionWithParameters(action.actionName, action.parameters);
                        if(this._stopCheck(result)) break;
                        await this._pauseCheck(result, store.general.pauseAfterEveryAction);
                    }
    
                    console.log(`Pipeline ${pipeline.name} ended.`);
                    this.emit("pipelineend", pipeline.name);
                    await this._runPipelineEnd();
    
                    if(this._stopCheck()) break;
                    await this._pauseCheck(null, store.general.pauseAfterEveryPipeline);
                }

                // TODO Use configured processed directory
                this._imageFileMover.moveToProcessed(image, "./Processed");
            }
            catch(e)
            {
                // TODO Use configured errored directory
                await this._pauseCheck(null, store.general.pauseOnExceptions);
                this._imageFileMover.moveToErrored(image, "./Errored", e.toString());
            }
            finally
            {
                await this._pauseCheck(null, store.general.pauseAfterEveryImage);
                if(this._stopCheck()) break;
            }
        }

        await this._runProcessEnd();
        this._processingMutex = false;
        this.state = PipelineEngineState.IDLE;
        console.log("Pipeline process loop exited.");
    }
    _runProcessStart()
    {
        return host.runJsx(`app.displayDialogs = DialogModes.NO;`);
    }
    _runProcessEnd()
    {
        return host.runJsx(`closeAll(); $.gc();`);
    }
    /**
     * Close all documents. Save Photoshop settings. Instantiate IMAGE instance.
     * @param {Image} image 
     * @returns {Promise}
     */
    _runPipelineStart(image)
    {
        return host.runJsx(`
        __PIPELINE = {
            restoreUnits = _.saveUnits(); 
        };
        IMAGE = new ImageForProcessing(${JSON.stringify(image)});`);
    }
    /**
     * Restore Photoshop settings. Clear IMAGE Instance.
     * @param {Image} image 
     * @returns {Promise}
     */
    _runPipelineEnd()
    {
        return host.runJsx(`
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