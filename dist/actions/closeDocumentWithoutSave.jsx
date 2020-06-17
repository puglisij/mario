/**
* Close the active document without saving
*/
action.closeDocumentWithoutSave = function closeDocumentWithoutSave()
{
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}