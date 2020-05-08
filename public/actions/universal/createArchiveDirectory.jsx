/**
* Creates the archive directory for the IMAGE in process, if it does not exist already
* Archive directory will be created by combining IMAGE.data("archiveDirectory") and the given parameter.
* @param {string} archiveName the name or subdirectory path e.g. "RGB/XY"
*/
universal.createArchiveDirectory = function createArchiveDirectory(archiveName)
{
    var archiveDirectory= IMAGE.data("archiveDirectory") || "../Archive";
        archiveDirectory = archiveDirectory + "/" + archiveName.toLowerCase();

    var currentDir = Folder.current;
    Folder.current = new Folder(IMAGE.getInputSourceDirectory());
    var folder = new Folder(archiveDirectory);
    Folder.current = currentDir;

    return action.createDirectory(folder);
}