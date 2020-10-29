
export default class PipelineEngineStatus
{
    constructor() 
    {
        this.reset();
        Object.seal(this);
    }
    reset() {
        this.jobId = "";
        this.jobCreationTime = "";
        this.files = [];
        this.fileCount = 0;
        this.file = "";
        this.imageJobId = "";
        this.imageIteration = 0;
        this.pipeline = "";
        this.action = "";
    }
    serialize() {
        return {
            ...this
        }
    }
}