/**
* Creates the archive directory for the IMAGE in process, if it does not exist already
* Archive directory will be created by combining IMAGE.data("archiveDirectory") and the given parameter.
* @param {string} archiveName the name or subdirectory path e.g. "RGB/XY"
*/
universal.createArchiveDirectory = function createArchiveDirectory(archiveName)
{
    var archiveDirectoryRoot = IMAGE.data("archiveDirectory") || activeDocument.path + "/../Archive";
    var archiveDirectory = new Folder(archiveDirectoryRoot + "/" + archiveName.toLowerCase());
    return action.createDirectory(archiveDirectory);
}