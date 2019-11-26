/**
* Deletes hidden layers 
*/
action.removeHiddenLayers = function removeHiddenLayers()
{
    try {
        var id1616 = charIDToTypeID("Dlt "); // delete
        var desc325 = new ActionDescriptor();
        var id1617 = charIDToTypeID("null");
        var ref254 = new ActionReference();
        var id1618 = charIDToTypeID("Lyr "); // layer
        var id1619 = charIDToTypeID("Ordn"); // ordinal
        var id1620 = stringIDToTypeID("hidden");
        ref254.putEnumerated(id1618, id1619, id1620);
        desc325.putReference(id1617, ref254);
        executeAction(id1616, desc325, DialogModes.NO);
    } catch(err) {}

}