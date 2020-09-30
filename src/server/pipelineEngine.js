import EventEmitter from "events";
import _ from '../utils';
import ArrayMap from '../arrayMap';
import store from '../store';
import host from '../host';
import Image from './image';
import ImageSource from './imageSource';
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
     * Run the given pipeline using its configured file source(s)
     * @param {string} pipelineName pipeline name
     */
    run(pipelineName)
    {
        this._run([pipelineName]);
    }
    /**
     * Run all pipelines using their configured file source(s)
     */
    runAll()
    {
        this._run(
            store.pipelines.pipelines.map(p => p.name)
        );
    }
    _run(pipelineNames) 
    {
        if(!this.isStopped()) {
            console.log("Pipeline engine is already running.");
            return;
        }
        console.log(`Running pipelines: "${pipelineNames.join(",")}"`);
        this.state = PipelineEngineState.IDLE;

        // Collect all unique file sources for given pipelines
        let fileSourceNameToPipelineNames = new ArrayMap();
        pipelineNames.forEach(pipelineName =>
        {
            const pipeline = this._getConfigurationByPipelineName(pipelineName);
            const fileSourceNames = pipeline.sourceNames;
            for(let fileSourceName of fileSourceNames) {
                fileSourceNameToPipelineNames.set(fileSourceName, pipeline.name);
            }
        });
        // Create dictionary for convenience
        let fileSourceNameToFileSource = new Map();
        store.general.fileSources.forEach(fileSource => {
            fileSourceNameToFileSource.set(fileSource.name, fileSource);
        });
        // IMPORTANT: We Do Not want multiple producers for the same files
        // Which would happen if we looped by each pipeline and created its producers
        // since there is a many-to-one relationship between pipelines and file watchers
        for(let [fileSourceName, pipelineNames] of fileSourceNameToPipelineNames.map) 
        {
            // Create producer
            const fileSource = fileSourceNameToFileSource.get(fileSourceName);
            const imageSource = new ImageSource(
                fileSource.type, 
                fileSource.name,
                fileSource.sourceDirectory, 
                fileSource.sourceExtensions,
                fileSource.useOutputDirectory, 
                fileSource.outputDirectory, 
                fileSource.useProcessedDirectory,
                fileSource.processedDirectory,
                fileSource.useErrorDirectory,
                fileSource.errorDirectory
            );
            const producer = new ImageFileProducer(imageSource);
            this._addFileProducer(producer, pipelineNames);
        }
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
    _getUniqueFileSourceNamesByPipelineNames(pipelineNames)
    {
        // Get all unique file sources for given pipelines
        let sourceNames = pipelineNames.reduce((arr, name) => {
            const pipeline = this._getConfigurationByPipelineName(name);
            return arr.concat(pipeline.sourceNames);
        }, []);
        return _.unique(sourceNames);
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
        console.log(`Pipeline process loop started with ${this._imageFileQ.length} images in queue.`);
 
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
        this.emit("processstart");
        return host.runJsxWithThrow(`app.displayDialogs = DialogModes.NO;`);
    }
    async _runProcessLoop()
    {
        // TODO: Split this function out into separate class(s) (e.g. ImageProcessor)
        // where every responsibility is handled by only one class and each individual kind of error can only occur in one class
        let processedImages = [];
        let qFile;
        while(qFile = this._imageFileQ.pop()) 
        {
            const { file, producerId } = qFile;
            console.log(`Reading next file ${file} from producer ${producerId}.`);
            this.emit("processimage", file);

            // NOTE: image 'pipelines' property takes precedence over pipelines listed for producer
            const producer =  this._getProducerById(producerId);
            const imageSource = producer.getImageSource();
            const image = await this._imageFileReader.read(file, imageSource, store.general.doReadFileMetadata);
            const pipelines = (image.pipelines.length > 0) 
                ? this._getConfigurationsByPipelineNames(image.pipelines) 
                : this._getConfigurationsByProducerId(producerId);
            console.log(`Processing image: ${image.inputImagePath}`);
            console.dir(_.simpleDeepClone(image));

            // For each Pipeline configuration
            for(const pipeline of pipelines) 
            {
                if(pipeline.disabled) {
                    console.log(`Skipping disabled pipeline '${pipeline.name}'`);
                    continue;
                }

                try 
                {
                    image.pipeline = pipeline.name;
                    image.jobId = _.guid();
                    await this._runPipelineStart(image, pipeline);
    
                    // For each action function
                    for(const action of pipeline.actions) 
                    {
                        this.emit("action", action.actionName);
                        let result = await host.runActionWithParameters(action.actionName, action.parameters);
                        
                        if(this._stopCheck(result)) break;
                        await this._pauseCheck(result, store.general.pauseAfterEveryAction);
                        this.emit("actionend", action.actionName);
                    }
                }
                catch(e)
                {
                    console.error(e);
                    image.errors.push(e.toString());
                    await this._pauseCheck(null, store.general.pauseOnExceptions);
                }
                finally
                {
                    await this._runPipelineEnd(image, pipeline);

                    if(image.errors.length) break;
                    if(this._stopCheck()) break;
                    await this._pauseCheck(null, store.general.pauseAfterEveryPipeline);
                }
            }
            
            processedImages.push(image);
            await this._pauseCheck(null, store.general.pauseAfterEveryImage);
            if(this._stopCheck()) break;
        }

        if(!this._stopCheck())
        {
            console.log(`Moving ${processedImages.length} processed images...`);
            this._imageFileMover.move(processedImages);
        }
    }
    _runProcessEnd()
    {
        this.emit("processend");
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
        console.log(`Pipeline '${pipeline.name}' started for job ${image.jobId}.`);
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
    _runPipelineEnd(image, pipeline)
    {
        console.log(`Pipeline '${pipeline.name}' ended for job ${image.jobId}.`);
        this.emit("pipelineend", pipeline.name);
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