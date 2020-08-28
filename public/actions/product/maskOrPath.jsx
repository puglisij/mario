/**
* Knocks out an image using Masking or Pathing
* Image is trimmed by alpha 
* @param {object} options 
* @param {string} options.koMethod either "masked", "path", or "no_ko" 
*/
action.product.maskOrPath = function maskOrPath(options)
{
    options = options || {};

    var koMethod = !_.isUndefined(options.koMethod) ? options.koMethod : "path";
    if(!_.isString(koMethod)) {
        throw new Error("Invalid parameter 'koMethod'. Expected a string");
    }

    switch(koMethod) {
        case "path": 
            _pathActions("Path 1"); break;
        case "masked":
            _maskActions(); break;
        case "no_ko":
            return;
        default:
            throw new Error("Invalid 'koMethod' of " + koMethod);
            return;
    }

    try{
        activeDocument.trim(TrimType.TRANSPARENT);
    } catch(err){}

    /*
    *  Functions
    */
    function _pathActions(pathName) 
    {
        activeDocument.flatten();
        action.setColorChannel_8Bit();

        // Set background to layer
        activeDocument.layers[0].isBackgroundLayer = false;

        try {
            activeDocument.pathItems.getByName(pathName).makeSelection(0, true, SelectionType.REPLACE);
        } catch(e) {
            throw new Error(e + "\nCould not select path: " + pathName);
        }

        try {
            activeDocument.selection.invert();
            //Invert selection
            activeDocument.selection.clear();
            //Delete selection
            activeDocument.selection.deselect();
        } catch(err) {}
    }

    function _maskActions() 
    {
        action.hideBackgroundLayer();
        action.removeHiddenLayers();
        try {
            activeDocument.mergeVisibleLayers()
            activeDocument.activeLayer.rasterize(RasterizeType.ENTIRELAYER);
        }
        catch(err) {}
        action.setColorChannel_8Bit();
        
        try {
            // ======================================================= Select Layer    
            var id353 = stringIDToTypeID("selectAllLayers");
            var desc87 = new ActionDescriptor();
            var id354 = charIDToTypeID("null");
            var ref52 = new ActionReference();
            var id355 = charIDToTypeID("Lyr ");
            var id356 = charIDToTypeID("Ordn");
            var id357 = charIDToTypeID("Trgt");
            ref52.putEnumerated(id355, id356, id357);
            desc87.putReference(id354, ref52);
            executeAction(id353, desc87, DialogModes.NO);

            // ======================================================= Apply Mask
            var id358 = charIDToTypeID("Dlt ");
            var desc88 = new ActionDescriptor();
            var id359 = charIDToTypeID("null");
            var ref53 = new ActionReference();
            var id360 = charIDToTypeID("Chnl");
            var id361 = charIDToTypeID("Chnl");
            var id362 = charIDToTypeID("Msk ");
            ref53.putEnumerated(id360, id361, id362);
            desc88.putReference(id359, ref53);
            var id363 = charIDToTypeID("Aply");
            desc88.putBoolean(id363, true);
            executeAction(id358, desc88, DialogModes.NO);
            // ======================================================= trim down the Image.
        } catch(err) {}
    }
}

