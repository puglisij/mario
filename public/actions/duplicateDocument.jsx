/**
*  Duplicates the active document with the given name
* @param {string} [name]
* @param {bool} [mergeLayersOnly] whether to only duplicate merged layers
*/
action.duplicateDocument = function duplicateDocument(name, mergeLayersOnly)
{
    return activeDocument.duplicate(name, mergeLayersOnly);
}