/**
* Save the active document as a web JPG at the given size
* @param {object} options 
* @param {string} options.fileName can be a mustache template such as P{{sku}}HI.jpg
* @param {Number} [options.quality = 70] range from 1 to 100  
*/
product.saveForWeb = function saveForWeb(options) 
{
    var sku = IMAGE.data("sku");
    if(!sku) {
        throw new Error("Image data missing sku. Sku required for file name.");
    }
    if(_.isUndefined(options.fileName)) {
        throw new Error("fileName is undefined");
    }

    var fileName = IMAGE.parameters(options.fileName);
    var outputDirectory = universal.createOutputDirectory();
    var file = new File(outputDirectory + "/" + fileName);

    action.saveForWeb({ 
        file: file,
        quality: options.quality || 70
    });
}