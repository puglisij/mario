/**
* Hide the 'Background' layer if it exists
*/
action.hideBackgroundLayer = function hideBackgroundLayer()
{
    try {
        activeDocument.backgroundLayer.visible = false;
    } catch(e) {}
}