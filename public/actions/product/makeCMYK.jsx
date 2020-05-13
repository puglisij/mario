/**
* Create CMYK psd for use by Print and Lago
*/
product.makeCMYK = function makeCMYK()
{
    var BORDER_SIZE = 25;

    universal.private.eachAdditionalView(function(view)
    {
        product.maskOrPath({
            koMethod: view.koMethod
        });
        
        if(!_.isNull(view.currentScale) && !_.isNull(view.cmykTargetScale)) 
        {
            universal.resizeImageByTargetScale({
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
        universal.saveAsPSDToArchiveDirectory(
            "CMYK" + (view.archiveSubdirectory ? "/" + view.archiveSubdirectory : "")
        );
        action.revert();
        action.closeDocumentWithoutSave();
    });
}