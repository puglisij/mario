/**
* Hide the 'Background' layer if it exists
*/
action.hideBackgroundLayer = function hideBackgroundLayer()
{
    if(activeDocument.backgroundLayer) {
        activeDocument.backgroundLayer.visible = false;
    }
}