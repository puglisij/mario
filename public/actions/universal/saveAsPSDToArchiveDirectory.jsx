/**
* Save the active document to the archive directory. Created PSD does NOT become active document.
* See action.createArchiveDirectory() for details on location.
* @param {String} archiveName - the name of the archive subdirectory. For example, "RGB", "CMYK" or something else. 
*/
action.saveAsPSDToArchiveDirectory = function saveAsPSDToArchiveDirectory(archiveName)
{
    var archiveDirectory = action.createArchiveDirectory(archiveName);
    var archivePsd = new File(archiveDirectory.fullName + "/" + activeDocument.name);
    action.saveAsPSD(archivePsd);
};


