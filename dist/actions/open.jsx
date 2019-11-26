/**
* Opens the given file as the active document
* @param {string|File} file the File or path to open
*/
action.open = function open(file)
{
    var fileRef = new File(file);
    var docRef = app.open(fileRef);
    return app.activeDocument = docRef; 
}

