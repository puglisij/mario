

/**
* Assembles product views into a single web TIF. Also saves each view to RGB Archive. 
*/ 
product.makeWebTIF = function makeWebTIF()
{
    var sku = IMAGE.data("sku");
    if(!sku) {
        throw new Error("Image data missing sku.");
    }

    var tif;
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

        // Remove all alpha channel objects
        activeDocument.channels.removeAll();

        // Duplicate image becomes activeDocument
        var duplicateViewName = _.getDocumentNameWithoutExtension();
        var duplicateView = action.duplicateDocument(duplicateViewName);
        activeDocument = duplicateView;

        action.convertActiveLayerToSmartObject();
        activeDocument.activeLayer.name = duplicateViewName.toString();
        activeDocument.resizeCanvas("300px", "300px", AnchorPosition.MIDDLECENTER);
        
        if(view.isFromArchives) {
            action.setLayerIconColor(LayerIconColor.Violet);
        }

        // Trim transparent area around the image
        activeDocument.trim(TrimType.TRANSPARENT);

        universal.resizeLayerByTargetScale({
            currentScale: IMAGE.data("currentScale"),
            targetScale: IMAGE.data("webTifTargetScale")
        })
        
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
            action.makeWhiteBackground();
            action.saveAsTIF(newTifFilePath);

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
    });
}





