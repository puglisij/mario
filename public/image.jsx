/**
* Represents current image being processed in the Action pipeline
* Properties match definition on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    this.type       = json.type;     // e.g. Product
    this.fileName   = json.fileName;
    this.path       = json.path;
    // Metadata stored in the file (i.e. XMP/EXIF)
    this._metadata   = json.metadata;
    // External (stored outside file) metadata necessary for processing
    this._data       = json.data;     
}
/**
* Return property in data which matches the given key
*/
ImageForProcessing.prototype.get = function(key) 
{
    return this._data[key];
}
/**
* Return the image type string. Also see utils _.hasKeyword()
*/
ImageForProcessing.prototype.hasKeyword = function(keyword) 
{
    return this._metadata.Keywords.includes(keyword);
}
