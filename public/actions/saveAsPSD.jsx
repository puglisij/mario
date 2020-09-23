/**
* Saves the active document as PSD. The created PSD does NOT become active document.
* @param {string|File} file full path or File instance
*/
action.saveAsPSD = function saveAsPSD(file)
{
    // TODO: Add boolean flag to make active document
    var psdSaveOptions = new PhotoshopSaveOptions();
        psdSaveOptions.embedColorProfile = true;
        psdSaveOptions.alphaChannels = true;

    file = new File(file);
    IMAGE.addSavedFilePath(file.fsName);
    // File, options object, asCopy, Extension policy
    activeDocument.saveAs(file, psdSaveOptions, true, Extension.LOWERCASE);
};