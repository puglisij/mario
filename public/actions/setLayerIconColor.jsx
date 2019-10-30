/**
* Sets the layer color in the Layers panel 
* @param {LayerIconColor} color one of the static color values defined on LayerIconColor
*/
action.setLayerIconColor = function setLayerIconColor(color)
{
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
    var idVlt = s2t(color); 
    desc92.putEnumerated( idClr, idClr, idVlt );
    var idLyr = charIDToTypeID( "Lyr " ); // layer
    desc91.putObject( idT, idLyr, desc92 );
    executeAction( idsetd, desc91, DialogModes.NO );
}
this.LayerIconColor = {
    Red: "red",
    Orange: "orange",
    Yellow: "yellowColor",
    Green: "green",
    Blue: "blue",
    Violet: "violet",
    Gray: "gray"
};
