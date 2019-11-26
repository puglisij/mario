/**
* Saves the active document as JPG. The created PSD does NOT become active document.
* @param {object} options 
* @param {string|File} options.file full path or File instance
* @param {Number} [options.quality = 70] between 1 and 100
*/
action.saveForWeb = function saveForWeb(options)
{
    var exportOptions = new ExportOptionsSaveForWeb();
        exportOptions.blur = 0; 
        exportOptions.interlaced = false; // true for Progressive 
        exportOptions.format = SaveDocumentType.JPEG;
        exportOptions.quality = options.quality || 70;

    activeDocument.exportDocument(
        new File(options.file), 
        ExportType.SAVEFORWEB, 
        exportOptions
    );
}