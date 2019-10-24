
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
    - if TIF doesnt contain a path named "WEB" then document is trimmed to top left and canvas is resized to 300x300px.
    - Calls AdditionalViews()
        • Loops through illustrated use shots found (using mdfind) in /Volumes/photostore/RGB_Archive/
            ▫ Places shot as new player in TIF  
            ▫ Scales new layer to 29% ? 
            ▫ Converts new layer to Smart object
            ▫ Scales new layer based on keyword (4to1 [50%], or 1to1 [200%])
            ▫ Adds drop shadow and Unsharp Mask to new layer
            ▫ Sets new layer icon to purple
        • Loops through product shots found (using mdfind) in /Volumes/photowork/
            ▫ If layer already exists with shot name then it does nothing
            ▫ Creates a new layer with shot name and makes layer icon red 
            ▫ Fills the layer with purple, sets opacity to 100% and blend mode to multiply
    - if TIF doesnt have keyword "DONOTPCDUPE" and has child skus, then adds keyword "PackDupe"
    - Saves and closes TIF
*/
function Autotemplate()
{
    _.saveUnits();
 
    // remove all alpha channel objects
    activeDocument.channels.removeAll();
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    // duplicate image (becomes activeDocument)
    var duplicateDocumentName = _.getDocumentNameWithoutExtension();
    var duplicateDocument = activeDocument.duplicate(duplicateDocumentName);

    // new layer 
    var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
    executeAction(idnewPlacedLayer, undefined, DialogModes.NO);
    duplicateDocument.activeLayer.name = duplicateDocument.name.toString();

    // resize canvas
    ResizeCanvas("300px", "300px", "MIDDLECENTER");

    // trim transparent area around the image
    duplicateDocument.trim(TrimType.TRANSPARENT);

    ScaleLayerByRatio(_.hasKeyword("1to1") ? "1to1" : _.hasKeyword("4to1") ? "4to1" : "");
    DropShadow_Product();
    UnsharpMask(40, 0.4, 2);

    MakeNote(activeDocument.width - 20, activeDocument.height - 20);
    MoveNote(0, 20, 20);

    // Create new TIF if doesnt exist and remove layer with same name as duplicated document
    var newTifDocument = duplicateDocument;
    var newTifFile = new File(IMAGE.tifPath + "/" + SKU + ".tif");
    if (newTifFile.exists) 
    {
        newTifDocument = app.open(newTifFile);
        try {
            var tifActiveLayer = newTifDocument.artLayers.getByName(duplicateDocumentName);
            if (tifActiveLayer) {
                tifActiveLayer.remove();
            }
        } catch (err) {}

        // place duplicated document as new layer into tif and closes duplicated document
        activeDocument = duplicateDocument;
        duplicateDocument.activeLayer.duplicate(newTifDocument);
        duplicateDocument.close(SaveOptions.DONOTSAVECHANGES);
    } 
    else 
    {
        // The created TIF becomes the active document
        SaveTIF_Product(newTifFile);
        MakeWhiteBackground();
    }

    try {
        // Has path item web?
        activeDocument.pathItems.getByName("WEB");
    } catch (err) {
        newTifDocument.revealAll();
        newTifDocument.trim(TrimType.TOPLEFT);
        if (newTifDocument.height <= 300 && newTifDocument.width <= 300) {
            newTifDocument.resizeCanvas('300px', '300px')
        }
    }
    
    AdditionalViews();

    if(!_.hasKeyword("DONOTPCDUPE") && IMAGE.hasChildSkus()) {
        _.addKeyword("PackDupe");
    }
    newTifDocument.save();
    newTifDocument.close()

    _.refresh();
    _.restoreUnits();
}





