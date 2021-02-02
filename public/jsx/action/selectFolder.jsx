/**
* Select a folder using system dialog
* @param {string} [preselectFolder] path to starting directory
*/
action.selectFolder = function selectFolder(preselectFolder)
{
    var folder = null;
    if(!preselectFolder) {
        folder = Folder.selectDialog("Choose Folder");
    } else {
        folder = new Folder(preselectFolder).selectDlg();
    }
    return folder ? folder.fsName : null;
};