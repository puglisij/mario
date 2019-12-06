/**
* Save the active document to the archive directory. Created PSD does NOT become active document.
* See createArchiveDirectory() for details on location.
* @param {String} archiveName - the name or relative path of the archive subdirectory. For example, "RGB", "RGB/XY" or something else. 
*/
universal.saveAsPSDToArchiveDirectory = function saveAsPSDToArchiveDirectory(archiveName)
{
    var archiveDirectory = universal.createArchiveDirectory(archiveName);
    var archivePsd = new File(archiveDirectory.fullName + "/" + activeDocument.name);
    action.saveAsPSD(archivePsd);
};


