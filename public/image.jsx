/**
* Represents current image being processed in the Action pipeline
* Properties match definition on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    if(_.isString(json.inputImagePath) && json.inputImagePath.endsWith(".json")) {
        throw new Error("ImageForProcessing should not receive inputImagePath as json file.");
    } 

    // An absolute path to an image or directory, or blank
    this._inputImagePath   = json.inputImagePath;
    // The parent directory containing inputImagePath or if not defined, the inputDataPath
    this._inputDirectory  = json.inputDirectory;
    // Path to json file from which data was sourced, if available
    this._inputDataPath = json.inputDataPath;
    this._outputDirectory = json.outputDirectory;
    this._processedDirectory = json.processedDirectory;
    // External (stored outside file) metadata necessary for processing
    this._data       = json.data;     
    // Metadata (i.e. XMP/EXIF) stored in the image file, if available
    this._metadata   = json.metadata;
    // Context store for temporary values during the current image process 
    this._context = {};
}
/**
* Returns the absolute input source path, either an image file or directory
*/
ImageForProcessing.prototype.getInputPath = function() {
    return this._inputImagePath;
};
/**
* Returns the absolute parent directory containing inputImagePath or if not defined, the inputDataPath
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
* Returns absolute directory where processed input files 'will' be moved automatically (files are moved by engine on Node.js side)
*/
ImageForProcessing.prototype.getProcessedDirectory = function() {
    return this._processedDirectory;
};
/**
* Return property in data which matches the given key
*/
ImageForProcessing.prototype.data = function(key) 
{
    return this._data[key];
}
/**
* Set or get a context variable for the current image process
*/
ImageForProcessing.prototype.context = function(name, value)
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