function openAsActive(filePath)
{
    var fileRef = new File(filePath);
    var docRef = app.open(fileRef);
    app.activeDocument = docRef; 
}
function closeWithSave()
{
    app.activeDocument.close(SaveOptions.SAVECHANGES);
}
function closeWithoutSave()
{
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}
function closeAll()
{
    while(app.documents.length)
    {
        app.activeDocument.close();
    }
}

function runAction(actionFilePath, actionName, parameters)
{
    try { 
        var file = new File(actionFilePath).fsName; 
        $.evalFile(file); 
        $.writeln("worked");
        return this[actionName].call(null, parameters)
    } catch(e) { 
        alert("Cannot run action: " + actionName + " Exception: " + e); 
    }
}