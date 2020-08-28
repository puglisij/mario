

/**
 * Represents a single Image process
 */
export default class Image 
{
    constructor() 
    {
        /**
         * One of the following:
         *  - An absolute image path (e.g. a user selected directory)
         *  - An absolute directory path (e.g. when multiple input images are needed)
         *  - Blank, if there is no source file
         * IMPORTANT: This is the only 'required' field within an input json file
         * (i.e. an invalid/blank path will cause an error when using a json input file)
         */
        this.inputImagePath = "";
        /**
         * The parent directory containing the inputImagePath or inputDataPath, or blank if neither is defined
         */
        this.inputDirectory = "";
        /**
         * If available, the json data file for the Image process
         */
        this.inputDataPath = "";
        /**
         * If available (either via json or GUI configuration), the directory where output files should be written
         */
        this.outputDirectory = "";
        /**
         * If available (either via json or GUI configuration), the directory where processed input files will be moved
         */
        this.processedDirectory = "";
        /**
         * External data (stored outside file) metadata necessary for processing
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
    }
}

