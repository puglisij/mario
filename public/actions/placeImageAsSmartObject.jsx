/**
* Place the given FIle instance or file name as a smart object layer in the active document
* @param {string|File} image the file path or File instance
*/
action.placeImageAsSmartObject = function placeImageAsSmartObject(image)
{
    var idPlc = charIDToTypeID( "Plc " ); // placeEvent
    var desc242 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    desc242.putPath( idnull, new File(image) );
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
}