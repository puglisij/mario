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

/**
* Set the text of the note at the given index
*/
action.setNote = function setNote(noteIndex, text)
{
    var idsetd = charIDToTypeID( "setd" ); // set
    var desc235 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref40 = new ActionReference();
    var idannotation = stringIDToTypeID( "annotation" );
    ref40.putIndex( idannotation, noteIndex );
    desc235.putReference( idnull, ref40 );
    var idT = charIDToTypeID( "T   " ); // to
    var desc236 = new ActionDescriptor();
    var idTxtD = charIDToTypeID( "TxtD" ); // textData
    desc236.putData( idTxtD, text );
    var idtext = stringIDToTypeID( "text" );
    desc236.putString( idtext, text );
    var idannotation = stringIDToTypeID( "annotation" );
    desc235.putObject( idT, idannotation, desc236 );
    executeAction( idsetd, desc235, DialogModes.NO );
}

/**
* Moves the photoshop Note/Annotation to the given pixel position
* @param {Number} posX x axis position in pixels 
* @param {Number} posY y axis position in pixels
*/
action.moveNote = function moveNote(noteIndex, posX, posY) 
{
    try {
        var idsetd = charIDToTypeID("setd"); // set
        var desc56 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref33 = new ActionReference();
        var idannotation = stringIDToTypeID("annotation");
        ref33.putIndex(idannotation, noteIndex);
        desc56.putReference(idnull, ref33);
        var idT = charIDToTypeID("T   "); // to
        var desc57 = new ActionDescriptor();
        var idLctn = charIDToTypeID("Lctn"); // location
        var desc58 = new ActionDescriptor();
        var idHrzn = charIDToTypeID("Hrzn"); // horizontal
        var idPxl = charIDToTypeID("#Pxl"); // pixelsUnit
        desc58.putUnitDouble(idHrzn, idPxl, posX);
        var idVrtc = charIDToTypeID("Vrtc"); // vertical
        var idPxl = charIDToTypeID("#Pxl"); // pixelsUnit
        desc58.putUnitDouble(idVrtc, idPxl, posY);
        var idPnt = charIDToTypeID("Pnt "); // paint
        desc57.putObject(idLctn, idPnt, desc58);
        var idannotation = stringIDToTypeID("annotation");
        desc56.putObject(idT, idannotation, desc57);
        executeAction(idsetd, desc56, DialogModes.NO);
    } catch (err) {}
}