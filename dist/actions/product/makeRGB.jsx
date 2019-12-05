/**
* Create RGB psd for archives
*/
product.makeRGB = function makeRGB()
{
    var BORDER_SIZE = 50;
    
    universal.private.eachAdditionalView(function(view)
    {
        product.maskOrPath();

        // Add border 
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        activeDocument.resizeCanvas(
            activeDocument.width + BORDER_SIZE, 
            activeDocument.height + BORDER_SIZE, 
            AnchorPosition.MIDDLECENTER
        );

        action.convertToColorProfile("RGB");
        universal.saveAsPSDToArchiveDirectory("RGB");
        action.revert();
        action.closeDocument();
    })
}