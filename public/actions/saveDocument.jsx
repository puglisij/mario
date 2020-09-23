action.saveDocument = function saveDocument() 
{
    activeDocument.save();
    try {
        var file = activeDocument.path;
        IMAGE.addSavedFilePath(file.fsName);
    } catch(e) {}
}