import ImageFileProducer from './imageFileProducer';

/**
 * Manages ImageFileProducer instances
 */
class ImageFileProducers
{
    constructor() 
    {
        /**
         * Producer Id => [Listener Names...]
         */
        this._producerIdToListenerNames = new Map();
        /**
         * Producer Id => ImageFileProducer instance
         */
        this._producerIdToProducer = new Map();
        this._producerIdsWhichDepleted = [];
    }

    getProducerById(producerId)
    {
        return this._producerIdToProducer.get(producerId);
    }
    startProducer(imageSource, listenerNames) 
    {
        const producer = new ImageFileProducer(imageSource);
        this._producerIdToListenerNames.set(producer.id, listenerNames);
        this._producerIdToProducer.set(producer.id, producer);

        producer.on("files", this._onProducerFile.bind(this));
        producer.on("depleted", this._onProducerDepleted.bind(this));
        producer.produce();

        console.log(`Image File Producer ${producer.id} added.`);
    }
    hasProducers() {
        return this._producerIdToProducer.size > 0;
    }
    destroyAll()
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
            this._producerIdToListenerNames.delete(producerId);

            console.log(`Image File Producer ${producerId} destroyed.`);
        }
    }
    _destroyDepletedProducers()
    {
        this._destroyProducers(this._producerIdsWhichDepleted);
        this._producerIdsWhichDepleted = [];
    }
    _onProducerDepleted(producerId) 
    {
        this._producerIdsWhichDepleted.push(producerId);
    }
}