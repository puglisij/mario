/**
* Save the active document to the archive directory indicated in the IMAGE data. Created PSD does NOT become active document.
* Directory name will become "{archiveName}_Archive"
* @param {String} archiveName - Either "RGB", "CMYK" or something else. 
*/
action.savePSDToArchiveDirectory = function savePSDToArchiveDirectory(archiveName)
{
    var currentDir = Folder.current;
    var archiveRootDirectoryPath = IMAGE.get("archiveDirectory");
    var archiveRootDirectory = new Folder(archiveRootDirectoryPath);
    
    // create Archive directory if doesnt exist
    Folder.current = archiveRootDirectory;
    var archiveDirectory = new Folder("./Archive_" + archiveName);
    if(!archiveDirectory.exists) {
        archiveDirectory.create();
    }

    // save psd to Archive directory
    Folder.current = archiveDirectory;
    var archivePsd = new File("./" + activeDocument.name);
    action.saveAsPSD(archivePsd);

    // restore 
    Folder.current = currentDir;
}
