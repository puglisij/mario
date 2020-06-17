/**
* Return the absolute paths for current active file in the Adobe application, if any
* If file has not been saved, only its name is returned
* @param {object} options 
* @param {boolean} [options.skipReadonly = false]
* @param {boolean} [options.fullPath = true]
* @returns {string} the file path
*/
action.getActiveDocumentPath = function getActiveDocumentPath(options)
{
    options = Object.assign({
        skipReadonly: false, 
        fullPath: true
    }, options || {});

    var doc = app.activeDocument;
    if (doc.readonly && options.skipReadonly) {
        return "";
    } 
    var docPath = "";
    try {
        if(options.fullPath) {
            docPath = doc.fullName.fsName;
        } else {
            docPath = doc.name;
        }
    } catch(e) {
        docPath = doc.name;
    }
    
    return docPath;
}