/**
* Close the active document and save changes
*/
action.closeDocumentWithSave = function closeDocumentWithSave() 
{
    app.activeDocument.close(SaveOptions.SAVECHANGES);
}