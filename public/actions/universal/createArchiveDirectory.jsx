/**
* Creates the archive directory for the IMAGE in process, if it does not exist already
* If IMAGE.skuSuffix is defined the created directory will be at:
*   <archiveDirectory or ../Archive>/<archiveName>/<skuSuffix>/
* Otherwise it will be at:
*   <archiveDirectory or ../Archive>/<archiveName>/
* @param {string} archiveName the name of the archive subdirectory
*/
action.createArchiveDirectory = function createArchiveDirectory(archiveName)
{
    var subDirectory = IMAGE.get("skuSuffix");
    var archiveDirectoryRoot = IMAGE.get("archiveDirectory") || "../Archive";
    var archiveDirectory;
    if(subDirectory) {
        archiveDirectory = new Folder(archiveDirectoryRoot + "/" + archiveType + "/" + subDirectory)
    } else {
        archiveDirectory = new Folder(archiveDirectoryRoot + "/" + archiveType);
    } 
    return action.createDirectory(archiveDirectory);
}