/**
* Saves the active document as JPG. The created PSD does NOT become active document.
* @param {object} options 
* @param {string|File} options.file full path or File instance. Can also be a directory.
* @param {Number} [options.quality = 70] between 1 and 100
*/
action.saveForWeb = function saveForWeb(options)
{
    var exportOptions = new ExportOptionsSaveForWeb();
        exportOptions.blur = 0; 
        exportOptions.interlaced = false; // true for Progressive 
        exportOptions.format = SaveDocumentType.JPEG;
        exportOptions.quality = options.quality || 70;

    var file = new File(options.file);
    IMAGE.addSavedFilePath(file.fsName);

    activeDocument.exportDocument(
        file, 
        ExportType.SAVEFORWEB, 
        exportOptions
    );
}