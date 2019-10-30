/**
* If Image has keyword "masked" then masking actions are applied. Otherwise path actions are applied.
* @param {object} options 
* @param {Number} options.border the border size for pathing
*/
product.maskOrPath = function maskOrPath(options)
{
    var restoreUnits = _.saveUnits();
    if(_.hasKeyword("masked")) 
    {
        _maskActions();
    } else {
        _pathActions(options.border);
    }
    restoreUnits();

    
    /*
    *  Functions
    */
    function _pathActions(border) 
    {
        activeDocument.flatten();

        action.setColorChannel_8Bit();

        layerRef = activeDocument.artLayers.getByName("Background")
        // Set background to layer
        if (activeDocument.layers[0].isBackgroundLayer == true) activeDocument.layers[0].isBackgroundLayer = false
        try {
            // Set selection to "Path 1"
            activeDocument.pathItems.getByName("Path 1").makeSelection(0, true, SelectionType.REPLACE)
        } catch(err) {
            // has no Path
            return false;
        }

        try {
            activeDocument.selection.invert()
            //Invert selection
            activeDocument.selection.clear()
            //Delete selection
            activeDocument.selection.deselect()
            activeDocument.trim(TrimType.TRANSPARENT)

            app.preferences.rulerUnits = Units.PIXELS;
            activeDocument.resizeCanvas(activeDocument.width + border, activeDocument.height + border, AnchorPosition.MIDDLECENTER)
        } catch(err) {}

        return true;
    }

    function _maskActions(border) 
    {
        try {
            //Delete Hidden
            var id1616 = charIDToTypeID("Dlt ");
            var desc325 = new ActionDescriptor();
            var id1617 = charIDToTypeID("null");
            var ref254 = new ActionReference();
            var id1618 = charIDToTypeID("Lyr ");
            var id1619 = charIDToTypeID("Ordn");
            var id1620 = stringIDToTypeID("hidden");
            ref254.putEnumerated(id1618, id1619, id1620);
            desc325.putReference(id1617, ref254);
            executeAction(id1616, desc325, DialogModes.NO);
            var id1615 = charIDToTypeID("MrgV");
        } catch(err) {}
        
        try {
            activeDocument.mergeVisibleLayers()
            activeDocument.activeLayer.rasterize(RasterizeType.ENTIRELAYER)
            //Merge Visible
        }
        catch(err) {}

        action.setColorChannel_8Bit()
        
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
        
        try{

            activeDocument.trim(TrimType.TRANSPARENT)
            app.preferences.rulerUnits = Units.PIXELS;
            activeDocument.resizeCanvas(activeDocument.width + border, activeDocument.height + border, AnchorPosition.MIDDLECENTER)
        } catch(err){}
    }
}

