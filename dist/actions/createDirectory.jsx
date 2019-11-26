/**
* Create the directory if it doesnt exist. Creation is recursive.
* @param {string} folderPath see Javascript Tools Guide CC.pdf for cross platform path compatibility info
*/
action.createDirectory = function createDirectory(folderPath)
{
    var folder = new Folder(folderPath);
    if(!folder.exists) {
        folder.create();
    }
    return folder;
}