

/**
 * Represents a single Image process
 */
export default class Image 
{
    constructor() 
    {
        /**
         * The path value that initiated this Image process.
         * Depending on the File Source, this will be one of the following:
         * 1) the absolute input file/directory path
         * 2) the file/document name when full path is not available (e.g. an un-saved active document).
         * 3) empty string (e.g. File Source is Blank)
         */
        this.initialInputImagePath = "";
        /**
         * Same as initialInputImagePath except when initialInputImagePath is a json data file
         * in which case, this value is sourced from the json data.
         * NOTE: an invalid/blank inputImagePath will cause an error when using a json input file
         */
        this.inputImagePath = "";
        /**
         * The parent directory of initialInputImagePath, or blank if not available 
         */
        this.inputDirectory = "";
        /**
         * If available (either via json or GUI configuration), the directory where output files should be written
         */
        this.outputDirectory = "";
        this.useOutputDirectory = false;
        /**
         * If available (either via json or GUI configuration), the directory where processed input files will be moved
         */
        this.processedDirectory = "";
        this.useProcessedDirectory = false;
        /**
         * If available (either via json or GUI configuration), the directory where input files and error loges will be moved
         */
        this.errorDirectory = "";
        this.useErrorDirectory = false;
        /**
         * External data (stored outside file) metadata necessary for processing, as sourced from JSON
         */
        this.data = {};     
        /**
         * Internal data (Metadata stored in the file)
         */
        this.metadata = {}; 
        /**
         * (Optional) pipelines that should process this Image
         */
        this.pipelines = [];
        /**
         * The current pipeline processing this Image
         */
        this.pipeline = "";
        /**
         * The current job id being processed for this Image. 
         * This is unique to the current pipeline iteration for this Image instance
         */
        this.jobId = "";
        /**
         * An array of error messages encountered during processing, if applicable
         * @type {Array<string>} 
         */
        this.errors = [];
    }
}

