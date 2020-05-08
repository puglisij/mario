import Enum from '../enum';

const PipelineEngineState = new Enum([
    "STOPPED",
    "IDLE", 
    "PAUSED",
    "PROCESSING",
]);

export default PipelineEngineState;