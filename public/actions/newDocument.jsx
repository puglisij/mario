/**
* Create a new document 
* @param {object} [options]
* @param {UnitValue} options.width 
* @param {UnitValue} options.height 
* @param {number} options.resolution in pixels per inch
* @param {string} options.name 
* @param {NewDocumentMode} options.mode for example NewDocumentMode.GRAYSCALE
* @param {DocumentFill} options.initialFill for example DocumentFill.TRANSPARENT 
* @param {number} options.pixelAspectRatio 
* @param {BitsPerChannelType} options.bitsPerChannel for example BitsPerChannelType.EIGHT 
* @param {string} options.colorProfileName the name of the color profile. Valid only when using colorProfileType = ColorProfile.CUSTOM or WORKING
*/
action.newDocument = function newDocument(options)
{
    documents.add(
        options.width, 
        options.height, 
        options.resolution, 
        options.name, 
        options.mode, 
        options.initialFill, 
        options.pixelAspectRatio, 
        options.bitsPerChannel,
        options.colorProfileName
    );
}