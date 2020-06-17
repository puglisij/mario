/**
* Opens the given File, path, or name as the active document
* @param {string|File} file the File, file path to open, or name of an open document
* @returns {Document} the active document
*/
action.open = function open(file)
{
    var name = file;
    if(file instanceof File) {
        name = file.name;
    } 
    try {
        var docRef = app.documents.getByName(name);
        return app.activeDocument = docRef;
    } catch(e) {}

    if(!_.isFile(file)) {
        throw new Error("File: " + file + " is not a file.");
    }
    var fileRef = new File(file);
    var docRef = app.open(fileRef);
    return app.activeDocument = docRef; 
}

