

/**
 * Represents a single Image process
 */
export default class Image 
{
    constructor() 
    {
        /**
         * One of the following:
         *  - An absolute image path (e.g. if sourced from files open in the Adobe host application, or read from a user selected directory)
         *  - An absolute directory path (e.g. if sourced from json)
         *  - Blank, if there is no source file
         */
        this.imageInputSource = "";
        /**
         * If available, the json data file for the Image process
         */
        this.dataSource = "";
        /**
         * External data (stored outside file) metadata necessary for processing
         */
        this.data = {};     
        /**
         * Internal data (Metadata stored in the file)
         */
        this.metadata = null; 
    }
}

