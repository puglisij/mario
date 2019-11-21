/**
* Creates the archive directory for the IMAGE in process, if it does not exist already
* If IMAGE.skuSuffix is defined the created directory will be at:
*   <archiveDirectory or ../Archive>/<archiveName>/<skuSuffix>/
* Otherwise it will be at:
*   <archiveDirectory or ../Archive>/<archiveName>/
* @param {string} archiveName the name of the archive subdirectory
*/
universal.createArchiveDirectory = function createArchiveDirectory(archiveName)
{
    var subDirectory = IMAGE.data("skuSuffix");
    var archiveDirectoryRoot = IMAGE.data("archiveDirectory") || "../Archive";
    var archiveDirectory;
    if(subDirectory) {
        archiveDirectory = new Folder(archiveDirectoryRoot + "/" + archiveName.toLowerCase() + "/" + subDirectory.toLowerCase())
    } else {
        archiveDirectory = new Folder(archiveDirectoryRoot + "/" + archiveName.toLowerCase());
    } 
    return action.createDirectory(archiveDirectory);
}