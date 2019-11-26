/**
* Converts the active layer to a smart object 
*/
action.convertActiveLayerToSmartObject = function convertActiveLayerToSmartObject()
{
    var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
    executeAction(idnewPlacedLayer, undefined, DialogModes.NO);
}