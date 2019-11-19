/**
* Close the active document without saving
*/
action.closeDocument = function closeDocument()
{
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}