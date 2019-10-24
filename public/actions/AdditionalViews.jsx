/**
* Loads other shots (images), which match the current image docid or sku, as other layers, scales, sharpens, etc
*/
this.AdditionalViews = function AdditionalViews()
{
	$.writeln("AdditionalViews()");

	SetPreference_ResizeOnPaste(false);

    // Loop through other illustrated use shots that match this DocID in RGBArchive
    var file = null;
	var fileNames = IMAGE.illustratedUseShots;
    for (var i = 0; i < results.length; ++i)
    {
        file = new File(fileNames[i]);
        if(file.exists)
        {
            try { 
                activeDocument.artLayers.getByName(fileNames[i].match(/^[^.]+/).toString())
            } catch(err) {
        
                placeImage(file);
                
                if(_.hasKeyword("4to1"))
                {
                    ScaleLayerByPercent(50);
                }
                if(_.hasKeyword("1to1"))
                {
                    ScaleLayerByPercent(200);
                }

                DropShadow_Product();
                UnsharpMask(40, 1, 0);

                // make layer icon purple 
                var idsetd = charIDToTypeID( "setd" ); // set
                var desc91 = new ActionDescriptor();
                var idnull = charIDToTypeID( "null" );
                var ref68 = new ActionReference();
                var idLyr = charIDToTypeID( "Lyr " ); // layer
                var idOrdn = charIDToTypeID( "Ordn" ); // ordinal
                var idTrgt = charIDToTypeID( "Trgt" ); // targetEnum
                ref68.putEnumerated( idLyr, idOrdn, idTrgt );
                desc91.putReference( idnull, ref68 );
                var idT = charIDToTypeID( "T   " ); // to
                var desc92 = new ActionDescriptor();
                var idClr = charIDToTypeID( "Clr " ); // color
                var idVlt = charIDToTypeID( "Vlt " ); // violet
                desc92.putEnumerated( idClr, idClr, idVlt );
                var idLyr = charIDToTypeID( "Lyr " ); // layer
                desc91.putObject( idT, idLyr, desc92 );
                executeAction( idsetd, desc91, DialogModes.NO );
            }
        }
    }
	
    // Loop through other product use shots that match this SKU in RGBArchive
    var suffixes = IMAGE.productShots;
    for(var i = 0; i < suffixes.length; ++i)
    {
        try
        {
            activeDocument.artLayers.getByName(suffixes[i])
        }
        catch(err)
        {
            // make a new layer by given name and make layer icon red
            // =======================================================
            var idMk = charIDToTypeID( "Mk  " ); // make
            var desc62 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref26 = new ActionReference();
            var idLyr = charIDToTypeID( "Lyr " ); // layer
            ref26.putClass( idLyr );
            desc62.putReference( idnull, ref26 );
            var idUsng = charIDToTypeID( "Usng" ); // using
            var desc63 = new ActionDescriptor();
            var idNm = charIDToTypeID( "Nm  " ); // name
            desc63.putString( idNm, suffixes[i] );
            var idClr = charIDToTypeID( "Clr " ); // color
            var idRd = charIDToTypeID( "Rd  " ); // red
            desc63.putEnumerated( idClr, idClr, idRd );
            var idLyr = charIDToTypeID( "Lyr " ); // layer
            desc62.putObject( idUsng, idLyr, desc63 );
            executeAction( idMk, desc62, DialogModes.NO );

            // =======================================================
            // fill layer with color purple and set opacity 100% and blend mode to normal
            var idFl = charIDToTypeID( "Fl  " ); // fill
            var desc64 = new ActionDescriptor();
            var idUsng = charIDToTypeID( "Usng" ); // using
            var idFlCn = charIDToTypeID( "FlCn" ); // fillContents
            var idClr = charIDToTypeID( "Clr " ); // color
            desc64.putEnumerated( idUsng, idFlCn, idClr );
            var idClr = charIDToTypeID( "Clr " ); // color
            var desc65 = new ActionDescriptor();
            var idRd = charIDToTypeID( "Rd  " ); // red
            desc65.putDouble( idRd, 255.000000 );
            var idGrn = charIDToTypeID( "Grn " ); // green
            desc65.putDouble( idGrn, 0.000000 );
            var idBl = charIDToTypeID( "Bl  " ); // blue
            desc65.putDouble( idBl, 255.000000 );
            var idRGBC = charIDToTypeID( "RGBC" ); // RGBColor
            desc64.putObject( idClr, idRGBC, desc65 );
            var idOpct = charIDToTypeID( "Opct" ); // opacity
            var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
            desc64.putUnitDouble( idOpct, idPrc, 100.000000 );
            var idMd = charIDToTypeID( "Md  " ); // mode
            var idBlnM = charIDToTypeID( "BlnM" ); // blendMode
            var idNrml = charIDToTypeID( "Nrml" ); // normal
            desc64.putEnumerated( idMd, idBlnM, idNrml );
            executeAction( idFl, desc64, DialogModes.NO );
            
            // set layer blend mode to multiply
            var idsetd = charIDToTypeID( "setd" ); // set
            var desc69 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref30 = new ActionReference();
            var idLyr = charIDToTypeID( "Lyr " ); // layer
            var idOrdn = charIDToTypeID( "Ordn" ); // ordinal
            var idTrgt = charIDToTypeID( "Trgt" ); // targetEnum
            ref30.putEnumerated( idLyr, idOrdn, idTrgt );
            desc69.putReference( idnull, ref30 );
            var idT = charIDToTypeID( "T   " ); // to
            var desc70 = new ActionDescriptor();
            var idMd = charIDToTypeID( "Md  " ); // mode
            var idBlnM = charIDToTypeID( "BlnM" ); // blendMode
            var idMltp = charIDToTypeID( "Mltp" ); // multiply
            desc70.putEnumerated( idMd, idBlnM, idMltp );
            var idLyr = charIDToTypeID( "Lyr " ); // layer
            desc69.putObject( idT, idLyr, desc70 );
            executeAction( idsetd, desc69, DialogModes.NO );
        }
    }

	function placeImage(image)
    {
		var idPlc = charIDToTypeID( "Plc " ); // placeEvent
		var desc242 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
		desc242.putPath( idnull, image );
		var idFTcs = charIDToTypeID( "FTcs" ); // freeTransformCenterState
		var idQCSt = charIDToTypeID( "QCSt" ); // quadCenterState
		var idQcsa = charIDToTypeID( "Qcsa" ); // QCSAverage
		desc242.putEnumerated( idFTcs, idQCSt, idQcsa );
		var idOfst = charIDToTypeID( "Ofst" ); // offset
		var desc243 = new ActionDescriptor();
		var idHrzn = charIDToTypeID( "Hrzn" ); // horizontal
		var idRlt = charIDToTypeID( "#Rlt" ); // distanceUnit
		desc243.putUnitDouble( idHrzn, idRlt, 0.000000 );
		var idVrtc = charIDToTypeID( "Vrtc" ); // vertical
		var idRlt = charIDToTypeID( "#Rlt" ); // distanceUnit
		desc243.putUnitDouble( idVrtc, idRlt, 0.000000 );
		var idOfst = charIDToTypeID( "Ofst" ); // offset
		desc242.putObject( idOfst, idOfst, desc243 );
		executeAction( idPlc, desc242, DialogModes.NO );

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