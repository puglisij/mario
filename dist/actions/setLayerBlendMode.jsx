/**
* Sets the blend mode for the active layer
* @param {BlendMode} blendMode one of the values defined on jsx BlendMode enum
*   
*/
action.setLayerBlendMode = function setLayerBlendMode(blendMode)
{
    if (activeDocument.activeLayer) {
        activeDocument.activeLayer.blendMode = blendMode || BlendMode.NORMAL;
    }
}
// var idsetd = charIDToTypeID( "setd" );
// var desc159 = new ActionDescriptor();
// var idnull = charIDToTypeID( "null" );
// var ref51 = new ActionReference();
// var idLyr = charIDToTypeID( "Lyr " );
// var idOrdn = charIDToTypeID( "Ordn" );
// var idTrgt = charIDToTypeID( "Trgt" );
// ref51.putEnumerated( idLyr, idOrdn, idTrgt );
// desc159.putReference( idnull, ref51 );
// var idT = charIDToTypeID( "T   " );
// var desc160 = new ActionDescriptor();
// var idMd = charIDToTypeID( "Md  " );
// var idBlnM = charIDToTypeID( "BlnM" );
// var idMode = s2t( blendMode );
// desc160.putEnumerated( idMd, idBlnM, idMode );
// var idLyr = charIDToTypeID( "Lyr " );
// desc159.putObject( idT, idLyr, desc160 );
// executeAction( idsetd, desc159, DialogModes.NO );
// this.LayerBlendMode = {
//      Dissolve : " dissolve",
//     Darken : "darken",
//     Multiply : "multiply",
//     ColorBurn : "colorBurn",
//     LinearBurn : "linearBurn",
//     DarkerColor : "darkerColor",
//     Lighten : "lighten",
//     Screen : "screen",
//     ColorDodge : "colorDodge",
//     LinearDodge : "linearDodge",
//     LighterColor : "lighterColor",
//     Overlay : "overlay",
//     SoftLight : "softLight",
//     HardLight : "hardLight",
//     VividLight : "vividLight",
//     LinearLight : "linearLight",
//     PinLight : "pinLight",
//     HardMix : "hardMix",
//     Difference : "difference",
//     Exclusion : "exclusion",
//     Subtract : "blendSubtraction",
//     Divide : "blendDivide",
//     Hue : "hue",
//     Saturation : "saturation",
//     Color : "color",
//     Luminosity : "luminosity",
// };
// Dslv // Dissolve // dissolve
// Drkn // Darken // darken
// Mltp // Multiply // multiply
// CBrn // Color Burn // colorBurn
// ? // Linear Burn // linearBurn
// ? // Darker Color // darkerColor
// Lghn // Lighten // lighten
// Scrn // Screen // screen
// CDdg // Color Dodge // colorDodge
// ? // Linear Dodge (Add) // linearDodge 
// ? // Lighter Color // lighterColor
// Ovrl // Overlay // overlay
// SftL // Soft Light // softLight
// HrdL // Hard Light // hardLight
// ? // Vivid Light // vividLight
// ? // Linear Light // linearLight
// ? // Pin Light // pinLight
// ? // Hard Mix // hardMix
// Dfrn // Difference // difference
// Xclu //  Exclusion // exclusion
// ? // Subtract // blendSubtraction
// ? // Divide // blendDivide
// H   // Hue // hue
// Strt // Saturation // saturation
// Clr // Color // color
// Lmns // Luminosity // luminosity