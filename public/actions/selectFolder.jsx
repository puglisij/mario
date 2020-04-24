/**
* Select a folder using system dialog
* @param {string} [preselectFolder] path to starting directory
*/
action.selectFolder = function selectFolder(preselectFolder)
{
    if(!preselectFolder) {
        return Folder.selectDialog("Choose Folder");
    } else {
        return new Folder(preselectFolder).selectDlg();
    }
};