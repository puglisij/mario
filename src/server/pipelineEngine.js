import EventEmitter from "events";
import store from '../store';
import { ImageTap } from './imageFileProducer';

class PipelineEngine extends EventEmitter
{
    constructor() 
    {
        super();
        
    }
    init() 
    {
        // 
    }
    destroy()
    {

    }
    /**
     * Run the given pipeline with files from the given source
     * @param {string} pipeline pipeline name
     * @param {string} sourceType DIRECTORY, or OPENFILES
     * @param {string} sourcePath if sourceType is DIRECTORY
     * @param {string} sourceExtensions if sourceType is DIRECTORY
     */
    run(pipeline, sourceType, sourcePath, sourceExtensions)
    {

    }
    runAll()
    {
        // instantiate file watcher producers 
        for(const w of store.general.fileWatchers) 
        {
            const consumers = getPipelinesByFileWatcherName(w.name);
            const producer = ImageFileProducer.withFileWatcher(consumers.map(p => p.name), w.path, w.extensions);
            producer.on("files", files => {
                for(const c in consumers) {
                    c.consume(files);
                }
                // TODO destroy producer if depleted
            });
        }
    }
    getPipelinesByFileWatcherName(name) 
    {
        return this._pipelineConfig.pipelines.filter(p => p.watcherNames.includes(name));
    }
}