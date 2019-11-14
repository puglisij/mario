/**
* Represents current image being processed in the Action pipeline
* Properties match definition on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    this._imagePath   = json.imagePath;

    this._type       = json.type;     // e.g. Product
    // External (stored outside file) metadata necessary for processing
    this._data       = json.data;     
    // Metadata (i.e. XMP/EXIF) stored in the image file, if available
    this._metadata   = json.metadata;
    // Context store for temporary values during the current image process 
    this._context = {};
}
/**
* Return property in data which matches the given key
*/
ImageForProcessing.prototype.get = function(key) 
{
    return this._data[key];
}
ImageForProcessing.prototype.getType = function() {
    return this._type;
};
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
