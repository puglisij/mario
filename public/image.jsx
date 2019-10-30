/**
* Represents current image being processed in the Action pipeline
* Properties match definition on Client/Node.js/Panel side.
*/
function ImageForProcessing(json)
{
    this.type       = json.type;     // e.g. Product
    this.fileName   = json.fileName;
    this.path       = json.path;
    // External (stored outside file) metadata necessary for processing
    this.data       = json.data;     
    // Metadata stored in the file (i.e. XMP/EXIF)
    this.metadata   = json.metadata;
    // Metadata keywords stored in the file
    this.keywords   = json.keywords;
}
/**
* Return property in data which matches the given key
*/
ImageForProcessing.prototype.get = function(key) 
{
    return this.data[key];
}