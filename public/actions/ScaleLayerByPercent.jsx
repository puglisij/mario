/**
* Scale the active layer by the given percentage
* Layer is not moved.
* @param {Number} percentageX 
* @param {Number} percentageY
*/
action.scaleLayerByPercent = function scaleLayerByPercent(percentageX, percentageY)
{
    $.writeln("ScaleLayerByPercent()");

    percentageX = _.isUndefined(percentageX) ? 100 : percentageX;
    percentageY = _.isUndefined(percentageY) ? 100 : percentageY;
    
    if(percentageX == percentageY == 100) {
        return;
    }
    var scaleX = UnitValue(percentageX, "%");
    var scaleY = UnitValue(percentageY || percentageX, "%");

    try {
        var idTrnf = charIDToTypeID( "Trnf" ); // transform
        var desc3 = new ActionDescriptor();
        var idFTcs = charIDToTypeID( "FTcs" ); // freeTransformCenterState
        var idQCSt = charIDToTypeID( "QCSt" ); // quadCenterState
        var idQcsa = charIDToTypeID( "Qcsa" ); // QCSAverage
        desc3.putEnumerated( idFTcs, idQCSt, idQcsa );
        var idOfst = charIDToTypeID( "Ofst" ); // offset
        var desc4 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" ); // horizontal
        var idPxl = charIDToTypeID( "#Pxl" ); // pixelsUnit
        desc4.putUnitDouble( idHrzn, idPxl, 0.000000 );
        var idVrtc = charIDToTypeID( "Vrtc" ); // vertical
        var idPxl = charIDToTypeID( "#Pxl" ); // pixelsUnit
        desc4.putUnitDouble( idVrtc, idPxl, -0.000000 );
        var idOfst = charIDToTypeID( "Ofst" ); // offset
        desc3.putObject( idOfst, idOfst, desc4 );
        var idWdth = charIDToTypeID( "Wdth" ); // width
        var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
        desc3.putUnitDouble( idWdth, idPrc, scaleX );
        var idHght = charIDToTypeID( "Hght" ); // height
        var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
        desc3.putUnitDouble( idHght, idPrc, scaleY );
        var idLnkd = charIDToTypeID( "Lnkd" ); // linked
        desc3.putBoolean( idLnkd, true );
        executeAction( idTrnf, desc3, DialogModes.NO );
    } catch(err) {}
}