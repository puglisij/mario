import EventEmitter from "events";
import Rete from "rete"; 

import _ from '../utils';
import store from '../store';
import host from '../host';
import Image from './image';
import ImageFileMover from './imageFileMover';
import ImageFileReader from './imageFileReader';
import ImageFileProducers from './imageFileProducers';
import PipelineEngineState from './pipelineEngineState';
import PipelineEngineStatus from './pipelineEngineStatus';

export class PipelineEngine extends EventEmitter
{
    constructor() 
    {
        super();
        const self = this;
        this._processingMutex = false; 
        this._lastState = PipelineEngineState.STOPPED;
        this._state = PipelineEngineState.STOPPED;
        this._status = new Proxy(new PipelineEngineStatus(), 
            {
                set: function() { 
                    Reflect.set(...arguments);
                    self.emit("status", self._status);
                    return true;
                }
            }
        );
        this.on("jobstart", (jobId, jobCreationTime, files) => {
            this._status.jobId = jobId;
            this._status.jobCreationTime = jobCreationTime;
            this._status.files = files;
            this._status.fileCount = files.length;
        });
        this.on("imagejobstart", (imageJobId, imageIteration, file) => {
            this._status.imageJobId = imageJobId;
            this._status.imageIteration = imageIteration;
            this._status.file = file;
        });
        this.on("pipelinestart", pipelineName => { 
            this._status.pipeline = pipelineName; 
        });
        this.on("pipelineend", () => { 
            this._status.pipeline = ""; 
        });
        this.on("actionstart", actionName => { 
            this._status.action = actionName; 
        });
        this.on("actionend", () => { 
            this._status.action = ""; 
        });
        this.on("jobend", () => this._status.reset());
        this.on("processstart", () => this._status.reset());
        this.on("processend", () => this._status.reset());
        
        this._imageFileReader = new ImageFileReader();
        this._imageFileMover = new ImageFileMover();
        this._imageFileProducers = new ImageFileProducers();
        this._imageFileProducers.on("job", this._onProducerJob.bind(this));
        this._imageFileProducers.on("depleted", this._onProducerDepleted.bind(this));
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
        this._imageFileProducers.destroy();
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
        const pipelineNames = store.pipelines.pipelines.map(p => p.name);
        this._run(pipelineNames);
    }
    _run(pipelineNames) 
    {
        if(!this.isStopped()) {
            console.log("Pipeline engine is already running.");
            return;
        }
        console.log(`Running pipelines: "${pipelineNames.join(",")}"`);
        this.state = PipelineEngineState.IDLE;

        // IMPORTANT: We Do Not want multiple producers for the same files
        // Which would happen if we looped by each pipeline and created its producers
        // since there is a many-to-one relationship between pipelines and file watchers
        const imageSourceNameToPipelineNames = store.pipelines.getImageSourceNameToPipelineNameMap(pipelineNames);
        for(let [imageSourceName, toPipelineNames] of imageSourceNameToPipelineNames.map) 
        {
            const imageSource = store.general.getImageSourceByName(imageSourceName);         
            this._imageFileProducers.startProducer(imageSource, toPipelineNames);
        }
    }
    pause() {
        if(this.isProcessing() || this.isIdle()) {
            this.state = PipelineEngineState.PAUSED;
        }
    }
    resume() {
        if(this.isPaused() && this._lastState === PipelineEngineState.PROCESSING) {
            this.state = PipelineEngineState.PROCESSING;
        } else {
            this.state = PipelineEngineState.IDLE;
        }
    }
    stop() {
        this._imageFileProducers.stopProducers();
        this.state = PipelineEngineState.STOPPED;
    }
    _stopIfNoProducersElseIdle()
    {
        if(this.isStopped()) {
            return;
        }
        if(!this._imageFileProducers.hasProducers()) {
            this.stop();
        } else {
            this.state = PipelineEngineState.IDLE;
        }
    }
    

    _onProducerJob() 
    {
        this._process();
    }
    _onProducerDepleted() {
        if(this.isProcessing()) return;
        this._stopIfNoProducersElseIdle();
    }
    _process()
    {
        if(!this._imageFileProducers.hasJobs()) return; 
        if(this._processingMutex) return;
        this._processingMutex = true;
        this.state = PipelineEngineState.PROCESSING;

        this._runWaitOneFrame()
        .then(this._runProcessStart.bind(this))
        .then(this._runProcessLoop.bind(this))
        .then(this._runProcessEnd.bind(this))
        .then(() => {
            this._stopIfNoProducersElseIdle();
            this._processingMutex = false;
        });
    }
    _runWaitOneFrame()
    {
        return new Promise(resolve => { setTimeout(resolve, 0); });
    }
    async _runProcessStart()
    {
        await this._pauseCheck();

        console.log(`Pipeline process loop started with ${this._imageFileProducers.getTotalJobs()} jobs in queue.`);
        this.emit("processstart");
        await host.runJsxWithThrow(`app.displayDialogs = DialogModes.NO;`);
    }
    async _runProcessLoop()
    {
        let processedImages = [];
        let file;
        while(!this._stopCheck() && this._imageFileProducers.hasJobs()) 
        {
            const { 
                jobId, 
                jobCreationTime,
                listenerNames, 
                files, 
                imageSource } = this._imageFileProducers.nextJob();
            this.emit("jobstart", jobId, jobCreationTime, files.slice(0));
            console.log(`Job ${jobId} started with ${files.length} files.`);

            for(let i = 0; !this._stopCheck() && i < files.length; ++i)
            {
                await this._pauseCheck();
                const file = files[i];

                // READ IMAGE
                console.log(`Reading next file[${i}] ${file}.`);
                const image = await this._imageFileReader.read(file, imageSource, listenerNames);

                // EXECUTE PIPELINES
                if(!image.errors.length > 0) 
                {
                    await this._runPipelinesLoop(image);
                }

                processedImages.push(image);
                await this._pauseCheck(null, store.general.pauseAfterEveryImage);
            }
            this.emit("jobend");
        }
        
        return processedImages;
    }
    async _runProcessEnd(processedImages)
    {
        console.log("Waiting for unresolved callback tunnels...");
        await host.join();

        // CLEANUP
        if(this._stopCheck()) {
            host.runActionWithParameters(`action.closeAllWithoutSave`);
        } else {
            // We move at the end of the process, in case images/jobs are sharing files
            this._imageFileMover.move(processedImages);
        }

        console.log("Pipeline process exited.");
        this.emit("processend");
        await host.runJsxWithThrow(`$.gc();`);
    }
    /**
     * Execute pipeline action graph for this image
     * @param {Image} image 
     */
    async _runPipelinesLoop(image)
    {
        this.emit("imagejobstart", image.jobId, i, file);

        const pipelines = store.pipelines.getByNames(image.pipelines);
        for(const pipeline of pipelines) 
        {
            try 
            {
                await this._runPipelineStart(image, pipeline);

                // EXECUTE PIPELINE
                for(const action of pipeline.actions) 
                {
                    this.emit("actionstart", action.actionName);
                    let result = await host.runActionWithParameters(action.actionName, action.parameters);
                    
                    if(this._stopCheck(result)) break;
                    await this._pauseCheck(result, store.general.pauseAfterEveryAction);
                    this.emit("actionend");
                }
            }
            catch(e)
            {
                console.error(e);
                image.errors.push(e.toString());
                await host.runActionWithParameters(`action.closeAllWithoutSave`);
                await this._pauseCheck(null, store.general.pauseOnExceptions);
            }
            finally
            {
                if(image.errors.length) break;
                if(this._stopCheck()) break;
                await this._pauseCheck(null, store.general.pauseAfterEveryPipeline);
                await this._runPipelineEnd(image, pipeline);
            }
        }

        this.emit("imagejobend");
    }
    /**
     * Close all documents. Save Photoshop settings. Instantiate IMAGE instance.
     * @param {Image} image 
     * @param {object} pipeline the pipeline configuration object
     * @returns {Promise}
     */
    _runPipelineStart(image, pipeline)
    {
        console.log(`Pipeline '${pipeline.name}' started for image job ${image.jobId}.`);
        this.emit("pipelinestart", pipeline.name);
        return host.runJsxWithThrow(`
        __PIPELINE = {
            name: "${pipeline.name}",
            restoreUnits: _.saveUnits()
        };
        IMAGE = new ImageForProcessing(${JSON.stringify(image)});`);
    }
    /**
     * Restore Photoshop settings. Clear IMAGE instance.
     * @param {object} pipeline the pipeline configuration object 
     * @returns {Promise}
     */
    _runPipelineEnd(image, pipeline)
    {
        console.log(`Pipeline '${pipeline.name}' ended for image job ${image.jobId}.`);
        this.emit("pipelineend");
        return host.runJsx(`
        __PIPELINE.restoreUnits && __PIPELINE.restoreUnits(); 
        __PIPELINE=null;
        IMAGE=null;
        `);
    }
    _stopCheck(actionResult) 
    {
        if(this.isStopped() || actionResult === "STOP") {
            this.state = PipelineEngineState.STOPPED;
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
        return Promise.resolve();
    }
    
    get fullStatus() 
    {
        return {
            state: PipelineEngineState.toKey(this._state),
            jobs: this._imageFileProducers.getAllJobs(),
            status: this._status.serialize()
        };
    }
    get status() {
        return this._status.serialize();
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._lastState = this._state;
        this._state = value;
        this.emit("state", value);
    }
    isIdle() { return this.state === PipelineEngineState.IDLE; }
    isStopped() { return this.state === PipelineEngineState.STOPPED; }
    isPaused() { return this.state === PipelineEngineState.PAUSED; }
    isProcessing() { return this.state === PipelineEngineState.PROCESSING; }
}