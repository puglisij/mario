/**
* Create CMYK psd for use by Print and Lago
*/
product.makeCMYK = function makeCMYK()
{
    var viewsDirectory = IMAGE.getPackagePath();
    var views = IMAGE.data("additionalViews");
    if(!views) {
        throw new Error("Image data missing additionalViews.");
    }

    var BORDER_SIZE = 25;
    // Add Additional Views as Layers 
    for(var i = 0; i < views.length; ++i) 
    {
        var view = views[i];
        var viewIsFromArchives = view.isFromArchives;
        var viewFile = new File(viewsDirectory + "/" + view.file);
        var view = app.open(viewFile);

        product.maskOrPath();
        universal.resizeImageByTargetScale({
            currentScale: IMAGE.data("currentScale"), 
            targetScale: IMAGE.data("cmykTargetScale")
        });

        // Add border
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        activeDocument.resizeCanvas(
            activeDocument.width + BORDER_SIZE, 
            activeDocument.height + BORDER_SIZE, 
            AnchorPosition.MIDDLECENTER
        );

        action.convertToColorProfile("CMYK");
        universal.saveAsPSDToArchiveDirectory("CMYK");
        action.revert();
        action.closeDocument();
    }
}