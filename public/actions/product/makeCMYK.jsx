/**
* Create CMYK psd for use by Print and Lago
*/
action.product.makeCMYK = function makeCMYK()
{
    var BORDER_SIZE = 25;

    action.openEachImage(function(view)
    {
        action.product.maskOrPath({
            koMethod: view.koMethod
        });
        
        if(!_.isNull(view.currentScale) && !_.isNull(view.cmykTargetScale)) 
        {
            action.universal.resizeImageByTargetScale({
                currentScale: view.currentScale, 
                targetScale: view.cmykTargetScale
            }); 
        }
        
        // Add border
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        activeDocument.resizeCanvas(
            activeDocument.width + BORDER_SIZE, 
            activeDocument.height + BORDER_SIZE, 
            AnchorPosition.MIDDLECENTER
        );

        action.convertToColorProfile("CMYK");
        action.universal.saveAsPSDToOutputDirectory("CMYK");
        action.revert();
        action.closeDocumentWithoutSave();
    });
}