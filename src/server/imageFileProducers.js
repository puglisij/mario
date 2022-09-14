import EventEmitter from "events";
import ImageFileProducer from './imageFileProducer';
import _ from '../utils';

/**
 * Manages ImageFileProducer instances and produces image jobs
 */
export default class ImageFileProducers extends EventEmitter
{
    constructor() 
    {
        super();
        /**
         * Producer Id => [Listener Names...]
         */
        this._producerIdToListenerNames = new Map();
        /**
         * Producer Id => ImageFileProducer instance
         */
        this._producerIdToProducer = new Map();

        this._jobs = [];
    }
    destroy()
    {
        this.stopProducers();
        this.removeAllListeners();
    }
    /**
     * Create and start a producer with the given ImageSource
     * @param {ImageSource} imageSource 
     * @param {Array<string>} listenerNames 
     */
    startProducer(imageSource, listenerNames) 
    {
        const producer = new ImageFileProducer(imageSource);
        console.log(`Image File Producer created:\n${producer.toString()}`);

        this._producerIdToListenerNames.set(producer.id, listenerNames);
        this._producerIdToProducer.set(producer.id, producer);

        producer.on("files", this._onProducerFiles.bind(this));
        producer.on("depleted", this._onProducerDepleted.bind(this));
        producer.produce();
    }
    /**
     * Stops all ImageFileProducer instances and clears the job queue
     */
    stopProducers() {
        console.log(`Image File Producer stopping all producers and clearing jobs.`);
        const producerIds = [...this._producerIdToProducer.keys()];
        this._stopProducers(producerIds);
        this._jobs = [];
    }
    hasProducers() {
        return this._producerIdToProducer.size > 0;
    }
    hasJobs() {
        return this._jobs.length > 0;
    }
    nextJob() {
        return this._jobs.pop();
    }
    /**
     * @readonly
     */
    getAllJobs() {
        return this._jobs; // TODO: Clone?
    }
    getTotalJobs() {
        return this._jobs.length;
    }
    _stopProducers(producerIds)
    {
        producerIds = producerIds.filter(id => this._producerIdToProducer.has(id));
        for(const producerId of producerIds) 
        {
            const producer = this._producerIdToProducer.get(producerId);
            console.log(`Image File Producer destroyed:\n${producer.toString()}`);

            this._producerIdToProducer.delete(producerId);
            this._producerIdToListenerNames.delete(producerId);
            producer.destroy();
        }
    }
    _onProducerFiles(producerId, files)
    {
        const listenerNames = this._producerIdToListenerNames.get(producerId);
        const imageSource = this._producerIdToProducer.get(producerId).getImageSource();
        this._jobs.push({
            jobId: _.guid(), 
            jobCreationTime: _.yyyymmddhhmmssuu(),
            listenerNames: listenerNames.slice(0),
            files, 
            imageSource: imageSource.clone()
        });
        this.emit("job");
        console.log(`Image File Producer ${producerId}: Job produced.`);
    }
    _onProducerDepleted(producerId) 
    {
        this._stopProducers([producerId]);
        this.emit("depleted");
    }
}