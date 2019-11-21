
/**
* Assembles product views into a single web TIF. Also saves each view to RGB Archive. 
*/ 
product.makeWebTIF = function makeWebTIF()
{
    var sku = IMAGE.data("sku");
    if(!sku) {
        throw new Error("Image data missing sku.");
    }

    var viewsDirectory = IMAGE.getPackagePath();
    var views = IMAGE.data("additionalViews");
    if(!views) {
        throw new Error("Image data missing additionalViews.");
    }

    var tif;
    var BORDER_SIZE = 50;
    // Add Additional Views as Layers 
    for(var i = 0; i < views.length; ++i) 
    {
        var view = views[i];
        var viewIsFromArchives = view.isFromArchives;
        var viewFile = new File(viewsDirectory + "/" + view.file);
        var view = app.open(viewFile);
        
        action.convertToColorProfile("RGB");
        product.maskOrPath();

        // Add border 
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        activeDocument.resizeCanvas(
            activeDocument.width + BORDER_SIZE, 
            activeDocument.height + BORDER_SIZE, 
            AnchorPosition.MIDDLECENTER
        );

        universal.saveAsPSDToArchiveDirectory("RGB");

        // Remove all alpha channel objects
        activeDocument.channels.removeAll();

        // Duplicate image becomes activeDocument
        var duplicateViewName = _.getDocumentNameWithoutExtension();
        var duplicateView = action.duplicateDocument(duplicateViewName);
        activeDocument = duplicateView;

        action.convertActiveLayerToSmartObject();
        activeDocument.activeLayer.name = duplicateViewName.toString();
        activeDocument.resizeCanvas("300px", "300px", AnchorPosition.MIDDLECENTER);

        if(viewIsFromArchives) {
            action.setLayerIconColor(LayerIconColor.Violet);
        }

        // Trim transparent area around the image
        activeDocument.trim(TrimType.TRANSPARENT);

        var scale = 29;
        if (_.hasKeyword("1to1")) {
            scale = 58;
        }
        if (_.hasKeyword("4to1")) {
            scale = 17;
        }
        action.scaleLayerByPercent(scale);
        product.dropShadow();
        action.unsharpMask({
            amountPercent: 40,
            radiusPixels: 0.4,
            thresholdLevels: 2
        });
        
         // Create TIF, if not created
        if(!tif) {
            // The created TIF becomes the active document
            var outputDirectory = universal.createOutputDirectory();
            var newTifFilePath = outputDirectory.fullName + "/" + sku + ".tif";
            action.saveAsTIF(newTifFilePath);
            action.makeWhiteBackground();

            tif = activeDocument;
            activeDocument = tif;
        } else {
            // Place duplicated document as new layer into TIF
            activeDocument = duplicateView;
            duplicateView.activeLayer.duplicate(tif);
            duplicateView.close(SaveOptions.DONOTSAVECHANGES);
            activeDocument = tif;
        }
        
        product.trimAndResizeCanvas();
    }
}





