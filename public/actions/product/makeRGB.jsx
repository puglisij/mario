/**
* Create RGB psd for archives
*/
action.product.makeRGB = function makeRGB()
{
    var BORDER_SIZE = 50;
    
    action.openEachImage(function(view)
    {
        if(view.isFromArchives) {
            return;
        }
        action.product.maskOrPath({
            koMethod: view.koMethod
        });

        // Add border 
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        activeDocument.resizeCanvas(
            activeDocument.width + BORDER_SIZE, 
            activeDocument.height + BORDER_SIZE, 
            AnchorPosition.MIDDLECENTER
        );

        action.convertToColorProfile("RGB");
        action.universal.saveAsPSDToOutputDirectory("RGB");
        action.revert();
        action.closeDocumentWithoutSave();
    })
}