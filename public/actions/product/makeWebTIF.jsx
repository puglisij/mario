

/**
* Assembles product views into a single web TIF. 
*/ 
action.product.makeWebTIF = function makeWebTIF()
{
    var sku = IMAGE.data("skuOrId");
    if(!sku) {
        throw new Error("Image data missing 'skuOrId'.");
    }

    var tif;
    var BORDER_SIZE = 50;

    action.openEachImage(function(view)
    {
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

        action.universal.resizeLayerByTargetScale({
            currentScale: view.currentScale,
            targetScale: view.webTifTargetScale
        });

        action.product.dropShadow();
        action.unsharpMask({
            amountPercent: 40,
            radiusPixels: 0.4,
            thresholdLevels: 2
        });
        
         // Create TIF, if not created
        if(!tif) {
            // The created TIF becomes the active document
            var outputDirectory = action.universal.createOutputDirectory();
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

        action.product.trimAndResizeCanvas();
    });
}





