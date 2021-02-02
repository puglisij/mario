/**
* Return the absolute paths for files open in the Adobe application, if any
* If file has not been saved, only its name is returned
* @param {object} options 
* @param {boolean} [options.skipReadonly = false]
* @param {boolean} [options.fullPath = true]
* @returns {string} a comma delimited list
*/
action.getOpenDocumentPaths = function getOpenDocumentPaths(options)
{
    options = Object.assign({
        skipReadonly: false, 
        fullPath: true
    }, options || {});

    var fullDocumentPaths = [];
    for(var i = 0; i < app.documents.length; ++i) {
        var doc = app.documents[i];
        if (doc.readonly && options.skipReadonly) {
            continue;
        } 
        var docPath;
        try {
            if(options.fullPath) {
                docPath = doc.fullName.fsName;
            } else {
                docPath = doc.name;
            }
        } catch(e) {
            docPath = doc.name;
        }
        fullDocumentPaths.push(docPath);
    }
    return fullDocumentPaths.join(",");
}