import EventEmitter from "events";
import _ from '../utils';
import ArrayMap from '../arrayMap';
import store from '../store';
import host from '../host';
import Image from './image';
import ImageSource from './imageSource';
import ImageFileMover from './imageFileMover';
import ImageFileReader from './imageFileReader';
import ImageFileProducers from './imageFileProducers';
import PipelineEngineState from './pipelineEngineState';

export class PipelineEngine extends EventEmitter
{
    constructor() 
    {
        super();
        this._processingMutex = false; 
        this._state = PipelineEngineState.STOPPED;
        this._job = {
            id: null, 
            pipeline: "", 
            action: "",
            file: ""
        };

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
        this._imageFileProducers = new ImageFileProducers();
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
        this._imageFileProducers.destroyAll();
        this.state = PipelineEngineState.STOPPED;
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

        const fileSourceNameToPipelineNames = store.pipelines.getFileSourceNameToPipelineNameMap();
        // IMPORTANT: We Do Not want multiple producers for the same files
        // Which would happen if we looped by each pipeline and created its producers
        // since there is a many-to-one relationship between pipelines and file watchers
        for(let [fileSourceName, pipelineNames] of fileSourceNameToPipelineNames.map) 
        {
            // Create producer
            const fileSource = store.general.getFileSourceByName(fileSourceName);
            const imageSource = ImageSource.fromFileSource(fileSource);
            this._imageFileProducers.startProducer(imageSource, pipelineNames);
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
        if(!this._imageFileProducers.hasProducers()) {
            this.state = PipelineEngineState.STOPPED;
        }
    }

    _clearFileQ() {
        console.log(`Image File Queue cleared.`);
        this._imageFileQ = [];
    }
    
    _getPipelineConfigurationsByProducerId(producerId) 
    {
        const pipelineNames = this._producerIdToPipelines.get(producerId);
        return store.pipelines.getByNames(pipelineNames);
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
    _process()
    {
        if(!this._imageFileQ.length) return;
        if(this._processingMutex) return;
        this._processingMutex = true;
        console.log(`Pipeline process loop started with ${this._imageFileQ.length} images in queue.`);

        
        this.state = PipelineEngineState.PROCESSING;
        this._runWaitOneFrame()
        .then(this._runProcessStart.bind(this))
        .then(this._runProcessLoop.bind(this))
        .then(this._runProcessEnd.bind(this))
        .then(() => {
            this.state = PipelineEngineState.IDLE;
            this._stopIfNoProducers();
            this._clearFileQ();
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

            if(this._stopCheck()) break;
            await this._pauseCheck();

            // NOTE: image 'pipelines' property takes precedence over pipelines listed for producer
            const producer =  this._getProducerById(producerId);
            const imageSource = producer.getImageSource();
            const image = await this._imageFileReader.read(file, imageSource, store.general.doReadFileMetadata);
            const pipelines = (image.pipelines.length > 0) 
                ? store.pipelines.getByNames(image.pipelines) 
                : this._getPipelineConfigurationsByProducerId(producerId);
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
                        console.log(`Action: ${action.actionName}`);
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
    get status() {
        // "state"
        // "pipelinestart", pipelineName 
        // "pipelineend"
        // "action", actionName 
        // "actionend"
        // "processimage", filePath 
        // "processend"
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