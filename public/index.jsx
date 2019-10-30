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

var action = {};
function importAction(actionFilePath)
{
    try { 
        var file = new File(actionFilePath).fsName; 
        $.evalFile(file); 
    } catch(e) { 
        alert("File: " + file + " Action Import Exception: " + e); 
    }
}
function runAction(actionName, parameters)
{
    try { 
        var result = this[actionName]; //.call(IMAGE, parameters);
        $.writeln(actionName + " action successful");
        return result;
    } catch(e) { 
        alert("Cannot run action: " + actionName + " Exception: " + e); 
    }
}