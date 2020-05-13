/**
* Loads other shots (images), which match the current image docid or sku, as other layers, scales, sharpens, etc
* Full description:
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
*/
product.addAdditionalShots= function addAdditionalShots()
{
	$.writeln("addAdditionalShots()");

	action.setPreference_ResizeOnPaste(false);

    // Loop through other illustrated use shots that match this DocID in RGBArchive
	var fileNames = IMAGE.data("illustratedUseShots");
    if (fileNames)
    {
        for (var i = 0; i < fileNames.length; ++i)
        {
            var file = new File(fileNames[i]);
            var fileNameNoExtension = _.getDocumentNameWithoutExtension(fileNames[i]);
            if(file.exists)
            {
                if(!_.getLayerByName(fileNameNoExtension)) 
                {
                    action.placeImageAsSmartObject(image);
                    _transformPlacedImage(file);
                    
                    if(_.hasKeyword("4to1")) {
                        action.scaleLayerByPercent(50);
                    }
                    if(_.hasKeyword("1to1")) {
                        action.scaleLayerByPercent(200);
                    }

                    product.dropShadow();
                    action.unsharpMask({
                        amountPercent: 40,
                        radiusPixels: 0.4,
                        thresholdLevels: 2
                    });
                    action.setLayerIconColor(LayerIconColor.Violet);
                }
            }
        }
    }

	
    // Loop through other product use shots that match this SKU in RGBArchive
    var suffixes = IMAGE.data("productShots");
    if(suffixes)
    {
        for(var i = 0; i < suffixes.length; ++i)
        {
            if(!_.getLayerByName(suffixes[i]))
            {
                action.makeLayer(suffixes[i]);
                action.setLayerIconColor(LayerIconColor.Red)
                action.fillLayer({ r: 255, g: 0, b: 255 });
                action.setLayerBlendMode(BlendMode.MULTIPLY);
            }
        }
    }


	function _transformPlacedImage(image)
    {
		var idTrnf = charIDToTypeID( "Trnf" ); // transform
		var desc178 = new ActionDescriptor();
		var idFTcs = charIDToTypeID( "FTcs" ); // freeTransformCenterState
		var idQCSt = charIDToTypeID( "QCSt" ); // quadCenterState
		var idQcsa = charIDToTypeID( "Qcsa" ); // QCSAverage
		desc178.putEnumerated( idFTcs, idQCSt, idQcsa );
		var idOfst = charIDToTypeID( "Ofst" ); // offset
		var desc179 = new ActionDescriptor();
		var idHrzn = charIDToTypeID( "Hrzn" ); // horizontal
		var idRlt = charIDToTypeID( "#Rlt" ); // distanceUnit
		desc179.putUnitDouble( idHrzn, idRlt, -0.000000 );
		var idVrtc = charIDToTypeID( "Vrtc" ); // vertical
		var idRlt = charIDToTypeID( "#Rlt" ); // distanceUnit
		desc179.putUnitDouble( idVrtc, idRlt, -0.000000 );
		var idOfst = charIDToTypeID( "Ofst" ); // offset
		desc178.putObject( idOfst, idOfst, desc179 );
		var idWdth = charIDToTypeID( "Wdth" ); // width
		var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
		desc178.putUnitDouble( idWdth, idPrc, 29 );
		var idHght = charIDToTypeID( "Hght" ); // height
		var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
		desc178.putUnitDouble( idHght, idPrc, 29 );
		var idLnkd = charIDToTypeID( "Lnkd" ); // linked
		desc178.putBoolean( idLnkd, true );
		executeAction( idTrnf, desc178, DialogModes.NO );

		// ======================================================= Open Smart Object
		var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
		    var desc471 = new ActionDescriptor();
		executeAction( idplacedLayerEditContents, desc471, DialogModes.NO );

		// ======================================================= Close Smart object
		var idCls = charIDToTypeID( "Cls " ); // close
		executeAction( idCls, undefined, DialogModes.NO );
	}
}