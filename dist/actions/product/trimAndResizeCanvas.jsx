/**
* If no path exists with name "WEB" than document is trimmed to top left and canvas resized.
*/
product.trimAndResizeCanvas = function trimAndResizeCanvas()
{
    if(!_.getPathByName("WEB")) 
    {
        activeDocument.revealAll();
        activeDocument.trim(TrimType.TOPLEFT);
        if (activeDocument.height <= 300 && activeDocument.width <= 300) {
            activeDocument.resizeCanvas('300px', '300px')
        }
    }
}