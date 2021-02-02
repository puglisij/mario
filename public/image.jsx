/**
* Represents current IMAGE being processed in the Action pipeline
* Properties match definition of Image class on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    if(_.isString(json.inputImagePath) && json.inputImagePath.endsWith(".json")) {
        throw new Error("ImageForProcessing should not receive inputImagePath as json file.");
    } 

    this._initialInputImagePath = json.initialInputImagePath;
    this._inputImagePath   = json.inputImagePath;
    this._inputDirectory  = json.inputDirectory;

    this._outputDirectory = json.outputDirectory;
    this._processedDirectory = json.processedDirectory;
    this._errorDirectory = json.erroredDirectory;

    // The current job id being processed for this IMAGE
    this._jobId = json.jobId;
    // External (stored outside file) metadata necessary for processing
    this._data       = json.data;     
    // Metadata (i.e. XMP/EXIF) stored in the IMAGE file, if available
    this._metadata   = json.metadata;
    // Context store for temporary values during the current IMAGE process 
    this._context = {};
    // An array of full file paths that have been saved by the current pipeline 
    // This is expected to be updated by Actions which perform file saving operations
    this._savedFilePaths = [];
}
ImageForProcessing.prototype.addSavedFilePath = function(fullPath) {
    this._savedFilePaths.push(new File(fullPath).fsName);
};
ImageForProcessing.prototype.getSavedFilePaths = function() {
    return this._savedFilePaths;
};
/**
* Returns the full path to the first files directory, if any file paths have been added.
*/
ImageForProcessing.prototype.getFirstSavedFileDirectory = function() {
    try {
        var firstFullPath = this._savedFilePaths[this._savedFilePaths.length - 1];
        var file = new File(firstFullPath);
        return file.parent.fsName;
    } catch(e) {
        return "";
    }
};
/**
* Returns the path value that initiated this Image process.
* Depending on the File Source, this will be one of the following:
* 1) the absolute input file/directory path
* 2) the file/document name full path is not available (e.g. an un-saved active document).
* 3) empty string (e.g. File Source is Blank)
*/
ImageForProcessing.prototype.getInitialInputImagePath = function() {
    return this._initialInputImagePath;
};
/**
* Returns the same value as initialInputImagePath except when initialInputImagePath is a json data file
* in which case, this value is sourced from the json data.
* NOTE: an invalid/blank inputImagePath will cause an error when using a json input file
*/
ImageForProcessing.prototype.getInputImagePath = function() {
    return this._inputImagePath;
};
/**
* Returns the parent directory of initialInputImagePath, or blank if not available
*/
ImageForProcessing.prototype.getInputDirectory = function() {
    return this._inputDirectory;
};
/**
* Returns absolute directory where output files 'should' be written (it's up to a given Pipeline/action to honor this)
*/
ImageForProcessing.prototype.getOutputDirectory = function() {
    return this._outputDirectory;
};
/**
* Returns absolute directory where processed input files 'will' be moved automatically 
* (files are moved by engine on Node.js side)
*/
ImageForProcessing.prototype.getProcessedDirectory = function() {
    return this._processedDirectory;
};
/**
* Returns absolute directory where errored input files and a log file will be moved automatically when an error
* is encountered during processing. (files are moved by engine on Node.js side)
*/
ImageForProcessing.prototype.getErrorDirectory = function() {
    return this._errorDirectory;
};
/**
* Returns the name of the pipeline that is currently processing this IMAGE
*/
ImageForProcessing.prototype.getPipelineName = function() {
    return __PIPELINE.name;
};
/**
* Returns the current job id for this IMAGE process
*/
ImageForProcessing.prototype.getJobId = function() {
    return this._jobId;
};
/**
* Return property in data which matches the given key
*/
ImageForProcessing.prototype.data = function(key) 
{
    if(key === undefined) {
        return this._data;
    }
    return this._data[key];
}
/**
* Set or get a blackboard variable for the current IMAGE process
*/
ImageForProcessing.prototype.blackboard = function(name, value)
{
    if(value === undefined) {
        return this._context[name];
    }
    this._context[name] = value;
};
/**
* Return the image type string. Also see utils _.hasKeyword()
*/
ImageForProcessing.prototype.hasKeyword = function(keyword) 
{
    return this._metadata.Keywords.includes(keyword);
}
/**
* Fill in the given templated parameter string with data. Only populates string parameters from IMAGE 'data'
* @param {string|object} params the parameter string e.g.  "myProductImage_{{sku}}.jpg"
*/
ImageForProcessing.prototype.parameters = function(params) 
{
    if(typeof params === "string") {
        return _.mustache(params, this._data);
    }
    if(typeof params === "object") {
        for(var key in params) {
            var value = params[key];
            if(typeof value === "string") {
                params[key] = _.mustache(value, this._data);
            }
        }
    }
    return params;
}

this.ImageForProcessing = ImageForProcessing;

"";