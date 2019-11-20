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
        // Scale
        var scale = 50;
        if (_.hasKeyword("2to1")) {
            scale = 50;
        }
        if (_.hasKeyword("4to1")) {
            scale = 25;
        }
        action.resizeImage({
            w: scale + "%",
            h: scale + "%", 
            method: ResampleMethod.BICUBIC
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
        action.saveAsPSDToArchiveDirectory("CMYK");
        action.revert();
        action.closeDocument();
    }
}