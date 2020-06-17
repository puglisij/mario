/**
* Close all open documents without saving
*/
action.closeAllWithoutSave = function closeAllWithoutSave()
{
    while(app.documents.length)
    {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}