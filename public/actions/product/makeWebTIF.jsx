
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
    // Remove all alpha channel objects
    activeDocument.channels.removeAll();
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    // Duplicate image becomes activeDocument
    var duplicateDocumentName = _.getDocumentNameWithoutExtension();
    var duplicateDocument = action.duplicateDocument(duplicateDocumentName);
    activeDocument = duplicateDocument;

    action.convertActiveLayerToSmartObject();
    activeDocument.activeLayer.name = duplicateDocumentName.toString();
    activeDocument.resizeCanvas("300px", "300px", AnchorPosition.MIDDLECENTER)
  
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
    action.setDropShadow_Product();
    action.unsharpMask({
        amountPercent: 40,
        radiusPixels: 0.4,
        thresholdLevels: 2
    });

    action.makeNote(activeDocument.width - 20, activeDocument.height - 20);
    action.moveNote(0, 20, 20);

    // TODO: Should we be building up a TIF by reopening it and adding new layers?
    //       It probably shouldnt be the image processors job to go out and find files.
    var sku = IMAGE.get("sku");
    if(!sku) {
        throw new Error("Image data missing sku.");
    }
    var outputDirectory = action.createOutputDirectory(outputDirectory);
    var newTifFilePath = outputDirectory + "/" + sku + ".tif";
    var newTifFile = new File(newTifFilePath);
    if (newTifFile.exists) 
    {
        // The opened TIF becomes active document
        var newTifDocument = app.open(newTifFile);
        _.removeLayerByName(duplicateDocumentName);

        // Place duplicated document as new layer into TIF
        activeDocument = duplicateDocument;
        duplicateDocument.activeLayer.duplicate(newTifDocument);
        duplicateDocument.close(SaveOptions.DONOTSAVECHANGES);
        activeDocument = newTifDocument;
    } 
    else 
    {
        // The created TIF becomes the active document
        action.saveAsTIF(newTifFile);
        action.makeWhiteBackground();
    }

    // From this point activeDocument is the TIF
}





