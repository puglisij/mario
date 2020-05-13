

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
         * External data (stored outside file) metadata necessary for processing
         */
        this.data = {};     
        /**
         * Internal data (Metadata stored in the file)
         */
        this.metadata = {}; 
    }
}

