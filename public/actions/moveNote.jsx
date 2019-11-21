
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