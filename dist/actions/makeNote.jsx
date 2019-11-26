/**
* Add a Note/Annotation in Photoshop
* @param {Number} posX x axis position in pixels 
* @param {Number} posY y axis position in pixels
*/
action.makeNote = function makeNote(posX, posY, sizeX, sizeY) 
{
    var idMk = charIDToTypeID( "Mk  " );
    var desc251 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref43 = new ActionReference();
    var idannotation = stringIDToTypeID( "annotation" );
    ref43.putClass( idannotation );
    desc251.putReference( idnull, ref43 );
    var idUsng = charIDToTypeID( "Usng" );
    var desc252 = new ActionDescriptor();
    var idLctn = charIDToTypeID( "Lctn" );
    var desc253 = new ActionDescriptor();
    var idHrzn = charIDToTypeID( "Hrzn" );
    var idRlt = charIDToTypeID( "#Rlt" );
    desc253.putUnitDouble( idHrzn, idRlt, posX || 0 );
    var idVrtc = charIDToTypeID( "Vrtc" );
    var idRlt = charIDToTypeID( "#Rlt" );
    desc253.putUnitDouble( idVrtc, idRlt, posY || 0 );
    var idPnt = charIDToTypeID( "Pnt " );
    desc252.putObject( idLctn, idPnt, desc253 );
    var idSz = charIDToTypeID( "Sz  " );
    var desc254 = new ActionDescriptor();
    var idHrzn = charIDToTypeID( "Hrzn" );
    var idRlt = charIDToTypeID( "#Rlt" );
    desc254.putUnitDouble( idHrzn, idRlt, sizeX || 240.000000 );
    var idVrtc = charIDToTypeID( "Vrtc" );
    var idRlt = charIDToTypeID( "#Rlt" );
    desc254.putUnitDouble( idVrtc, idRlt, sizeY || 140.000000 );
    var idOfst = charIDToTypeID( "Ofst" );
    desc252.putObject( idSz, idOfst, desc254 );
    var idannotType = stringIDToTypeID( "annotType" );
    var idannotType = stringIDToTypeID( "annotType" );
    var idannotText = stringIDToTypeID( "annotText" );
    desc252.putEnumerated( idannotType, idannotType, idannotText );
    var idannotation = stringIDToTypeID( "annotation" );
    desc251.putObject( idUsng, idannotation, desc252 );
    executeAction( idMk, desc251, DialogModes.NO );
}