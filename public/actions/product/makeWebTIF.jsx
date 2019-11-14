
/**
* Make web image TIF:
    - remove all alpha channels 
    - duplicates the image as new document (same name without extension) - ill refer to this as "clone" below
    - creates a new placed layer with clone name (becomes active layer - i think this effectively just renames the topmost layer in the doc)
    - Resizes the canvas to 300x300px
    - Trims the image based on transparency (this may result in an even smaller canvas size?)
    - Scales current layer based on a keyword (1to1 [58%], 4to1 [17%]) if no keyword its scaled by 29%
    - Adds a drop shadow to current layer
    - Adds unsharp mask to current layer
    - Adds an empty Note and moves it to 20, 20
    - loads a TIF by the sku name from the appropriate folder in /Working/Work/Web/  - Removes the layer matching the clone name. Places clone as a new layer into TIF . Closes clone without saving.
    - if TIF doesnt exist then it creates it and adds a white background
*/
product.makeWebTIF = function makeWebTIF()
{
    var sku = IMAGE.get("sku");
    if(!sku) {
        throw new Error("Image data missing sku.");
    }

    var tif;
    var viewPaths = IMAGE.get("additionalViews");
    if(!viewPaths) {
        throw new Error("Image data missing additionalViews.");
    }

    // Add Additional Views as Layers 
    for(var i = 0; i < viewPaths.length; ++i) 
    {
        var viewFile = new File(viewPaths[i]);
        // var view = app.open(viewFile);
        
        // action.setColorMode("RGB");
        // product.maskOrPath({ border: 50 });
        // action.saveToArchiveDirectory("RGB");

        // app.preferences.rulerUnits = Units.PIXELS;
        // app.preferences.typeUnits = TypeUnits.PIXELS;

        // // Remove all alpha channel objects
        // activeDocument.channels.removeAll();

        // // Duplicate image becomes activeDocument
        // var duplicateViewName = _.getDocumentNameWithoutExtension();
        // var duplicateView = action.duplicateView(duplicateViewName);
        // activeDocument = duplicateView;

        // action.convertActiveLayerToSmartObject();
        // activeDocument.activeLayer.name = duplicateViewName.toString();
        // activeDocument.resizeCanvas("300px", "300px", AnchorPosition.MIDDLECENTER);

        // // Trim transparent area around the image
        // activeDocument.trim(TrimType.TRANSPARENT);

        // var scale = 29;
        // if (_.hasKeyword("1to1")) {
        //     scale = 58;
        // }
        // if (_.hasKeyword("4to1")) {
        //     scale = 17;
        // }
        // action.scaleLayerByPercent(scale);
        // product.dropShadow();
        // action.unsharpMask({
        //     amountPercent: 40,
        //     radiusPixels: 0.4,
        //     thresholdLevels: 2
        // });

        //  // Create TIF, if not created
        // if(!tif) {
        //     // The created TIF becomes the active document
        //     var outputDirectory = action.createOutputDirectory(outputDirectory);
        //     var newTifFilePath = outputDirectory.fullName + "/" + sku + ".tif";
        //     action.saveAsTIF(newTifFile);
        //     action.makeWhiteBackground();

        //     tif = activeDocument;
        //     activeDocument = tif;
        // } else {
        //     // Place duplicated document as new layer into TIF
        //     activeDocument = duplicateView;
        //     duplicateView.activeLayer.duplicate(tif);
        //     duplicateView.close(SaveOptions.DONOTSAVECHANGES);
        //     activeDocument = tif;
        // }

        // product.trimAndResizeCanvas();
        // product.addAdditionalShots();
        // product.addKeyword_PackDupe();
    }
}





