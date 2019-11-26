/**
* Represents current image being processed in the Action pipeline
* Properties match definition on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    this._imagePath   = json.imagePath;
    this._packagePath = json.packagePath;

    this._type       = json.type;     // e.g. Product
    // External (stored outside file) metadata necessary for processing
    this._data       = json.data;     
    // Metadata (i.e. XMP/EXIF) stored in the image file, if available
    this._metadata   = json.metadata;
    // Context store for temporary values during the current image process 
    this._context = {};
}
ImageForProcessing.prototype.getType = function() {
    return this._type;
};
ImageForProcessing.prototype.getImagePath = function() {
    return this._imagePath;
};
ImageForProcessing.prototype.getPackagePath = function() {
    return this._packagePath;
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
"";