/**
* Fill the active layer with the given r,g,b and opacity color values
* @param {object} options
* @param {Number} options.r red value
* @param {Number} options.g green value
* @param {Number} options.b blue value
* @param {Number} options.a opacity percentage 
*/
action.fillLayer = function fillLayer(options)
{
    options = options || {};
    // activeDocument.selection.selectAll();
    // var mySolid = new SolidColor();
    // mySolid.rgb.red = red;
    // mySolid.rgb.green = green;
    // mySolid.rgb.blue = blue;
    // activeDocument.selection.fill(mySolid, ColorBlendMode.MULTIPLY, opacity, false);
    // activeDocument.selection.clear();

    // or 

    var idFl = charIDToTypeID( "Fl  " ); // fill
    var desc64 = new ActionDescriptor();
    var idUsng = charIDToTypeID( "Usng" ); // using
    var idFlCn = charIDToTypeID( "FlCn" ); // fillContents
    var idClr = charIDToTypeID( "Clr " ); // color
    desc64.putEnumerated( idUsng, idFlCn, idClr );
    var idClr = charIDToTypeID( "Clr " ); // color
    var desc65 = new ActionDescriptor();
    var idRd = charIDToTypeID( "Rd  " ); // red
    desc65.putDouble( idRd, options.r );
    var idGrn = charIDToTypeID( "Grn " ); // green
    desc65.putDouble( idGrn, options.g );
    var idBl = charIDToTypeID( "Bl  " ); // blue
    desc65.putDouble( idBl, options.b );
    var idRGBC = charIDToTypeID( "RGBC" ); // RGBColor
    desc64.putObject( idClr, idRGBC, desc65 );
    var idOpct = charIDToTypeID( "Opct" ); // opacity
    var idPrc = charIDToTypeID( "#Prc" ); // percentUnit
    desc64.putUnitDouble( idOpct, idPrc, options.opacity || 100 );
    var idMd = charIDToTypeID( "Md  " ); // mode
    var idBlnM = charIDToTypeID( "BlnM" ); // blendMode
    var idNrml = charIDToTypeID( "Nrml" ); // normal
    desc64.putEnumerated( idMd, idBlnM, idNrml );
    executeAction( idFl, desc64, DialogModes.NO );
}