/**
* Apply a drop shadow to the active layer
* @param {object} options
* @param {DropShadowBlendMode} [blendMode=DropShadowBlendMode.MULTIPLY] 
* @param {number} [red=0] shadow red channel
* @param {number} [green=0] shadow green channel
* @param {number} [blue=0] shadow blue channel 
* @param {number} [opacity=35] shadow opacity
* @param {number} [lightAngle=30] angle of the shadow light
* @param {number} [distance=3] shadow distance px
* @param {number} [spread=0] shadow spread %
* @param {number} [size=7] shadow size px
* @param {number} [noise=0] quality noise %
* @param {number} [antiAlias] whether to enable quality antialiasing 
* @param {bool} [knockOutDropShadow=true] whether the layer knocks out the drop shadow 
* @param {DropShadowContour} [contour=DropShadowContour.LINEAR] the quality contour of the shadow
*/
action.setDropShadow = function setDropShadow(options)
{
    options = options || {};
    options.blendMode = options.blendMode || DropShadowBlendMode.COLORBURN;
    options.red = options.red == undefined ? 0 : options.red;
    options.green = options.green == undefined ? 0 : options.green;
    options.blue = options.blue == undefined ? 0 : options.blue;
    options.opacity = options.opacity == undefined ? 35 : options.opacity;
    options.lightAngle = options.lightAngle == undefined ? 30 : options.lightAngle;
    options.distance = options.distance == undefined ? 3 : options.distance;
    options.spread = options.spread == undefined ? 0 : options.spread;
    options.size = options.size == undefined ? 7 : options.size;
    options.noise = options.noise == undefined ? 0 : options.noise;
    options.antiAlias = options.antiAlias == undefined ? false : options.antiAlias;
    options.knockOutDropShadow = options.knockOutDropShadow == undefined ? true : options.knockOutDropShadow;
    options.contour = options.contour || DropShadowContour.LINEAR;

    var idsetd = s2t("set");
    var desc46 = new ActionDescriptor();
    var idnull = s2t("null");
    var ref12 = new ActionReference();
    var idPrpr = s2t("property");
    var idLefx = s2t("layerEffects");
    ref12.putProperty( idPrpr, idLefx );
    var idLyr = s2t("layer");
    var idOrdn = s2t("ordinal");
    var idTrgt = s2t("targetEnum");
    ref12.putEnumerated( idLyr, idOrdn, idTrgt ); 
    desc46.putReference( idnull, ref12 );
    var idT = s2t("to");
    var desc47 = new ActionDescriptor();
    var idScl = s2t("scale");
    var idPrc = s2t("percentUnit");
    // not sure what this scale is for?
    desc47.putUnitDouble( idScl, idPrc, 416.666667 );  
    var idDrSh = s2t("dropShadow");
    var desc48 = new ActionDescriptor();
    var idenab = s2t("enabled");
    // enable drop shadow
    desc48.putBoolean( idenab, true );  
    var idpresent = s2t( "present" );
    desc48.putBoolean( idpresent, true );
    var idshowInDialog = s2t( "showInDialog" );
    desc48.putBoolean( idshowInDialog, true );

    // Structure
    //------------
    var idMd = s2t("mode");
    var idBlnM = s2t("blendMode");
    // blend mode
    var idCBrn = s2t(options.blendMode); 
    desc48.putEnumerated( idMd, idBlnM, idCBrn );
    var idClr = s2t("color");
    var desc49 = new ActionDescriptor();
    var idRd = s2t("red");
    // red
    desc49.putDouble( idRd, options.red ); 
    var idGrn = s2t("green");
    // green
    desc49.putDouble( idGrn, options.green ); 
    var idBl = s2t("blue");
    // blue
    desc49.putDouble( idBl, options.blue ); 
    var idRGBC = s2t("RGBColor");
    desc48.putObject( idClr, idRGBC, desc49 );
    var idOpct = s2t("opacity");
    var idPrc = s2t("percentUnit");
    // opacity
    desc48.putUnitDouble( idOpct, idPrc, options.opacity ); 
    var iduglg = s2t("useGlobalAngle");
    desc48.putBoolean( iduglg, false );
    var idlagl = s2t("localLightingAngle");
    var idAng = s2t("angleUnit");
    // light angle
    desc48.putUnitDouble( idlagl, idAng, options.lightAngle ); 
    var idDstn = s2t("distance");
    var idPxl = s2t("pixelsUnit");
    // distance
    desc48.putUnitDouble( idDstn, idPxl, options.distance ); 
    var idCkmt = s2t("chokeMatte");
    var idPxl = s2t("pixelsUnit");
    var idblur = s2t("blur");
    // spread
    desc48.putUnitDouble( idCkmt, idPxl, options.spread ); 
    var idPxl = s2t("pixelsUnit");
    // size
    desc48.putUnitDouble( idblur, idPxl, options.size ); 

    // Quality
    //------------
    var idNose = s2t("noise"); 
    var idPrc = s2t("percentUnit");
    // noise
    desc48.putUnitDouble( idNose, idPrc, options.noise ); 
    var idAntA = s2t("antiAlias");
    // antialias
    desc48.putBoolean( idAntA, options.antiAlias ); 

    var idTrnS = s2t("transferSpec");
    var desc50 = new ActionDescriptor();
    var idNm = s2t("name");
    // Contour
    desc50.putString( idNm, options.contour );

    var idShpC = s2t("shapeCurveType");
    desc48.putObject( idTrnS, idShpC, desc50 );
    var idlayerConceals = s2t( "layerConceals" ); 
     // Layer Knocks Out Drop Shadow (prevents shadow from being seen through transparent objects)
    desc48.putBoolean( idlayerConceals, options.knockOutDropShadow );
    var idDrSh = s2t("dropShadow");
    desc47.putObject( idDrSh, idDrSh, desc48 );
    var idLefx = s2t("layerEffects");
    desc46.putObject( idT, idLefx, desc47 );

    executeAction( idsetd, desc46, DialogModes.NO );
}
DropShadowContour = {
    LINEAR: "$$$/Contours/Defaults/Linear=Linear",
    CONE: "$$$/Contours/Defaults/Cone=Cone",
    CONE_INVERTED: "$$$/Contours/Defaults/ConeInverted=Cone - Inverted",
    COVE_DEEP: "$$$/Contours/Defaults/CoveDeep=Cove - Deep",
    COVE_SHALLOW: "$$$/Contours/Defaults/CoveShallow=Cove - Shallow",
    GAUSSIAN: "$$$/Contours/Defaults/Gaussian=Gaussian",
    HALF_ROUND: "$$$/Contours/Defaults/HalfRound=Half Round",
    RING: "$$$/Contours/Defaults/Ring=Ring",
    RING_DOUBLE: "$$$/Contours/Defaults/DoubleRing=Ring - Double",
    ROLLING_SLOPE_DESCENDING: "$$$/Contours/Defaults/RollingSlopeDescending=Rolling Slope - Descending",
    ROUNDED_STEPS: "$$$/Contours/Defaults/RoundedSteps=Rounded Steps",
    SAWTOOTH: "$$$/Contours/Defaults/Sawtooth1=Sawtooth 1"
};
DropShadowBlendMode = {
    NORMAL: "normal",
    DISSOLVE : "dissolve",
    DARKEN : "darken",
    MULTIPLY : "multiply",
    COLORBURN : "colorBurn",
    LINEARBURN : "linearBurn",
    DARKERCOLOR : "darkerColor",
    LIGHTEN : "lighten",
    SCREEN : "screen",
    COLORDODGE : "colorDodge",
    LINEARDODGE : "linearDodge",
    LIGHTERCOLOR : "lighterColor",
    OVERLAY : "overlay",
    SOFTLIGHT : "softLight",
    HARDLIGHT : "hardLight",
    VIVIDLIGHT : "vividLight",
    LINEARLIGHT : "linearLight",
    PINLIGHT : "pinLight",
    HARDMIX : "hardMix",
    DIFFERENCE : "difference",
    EXCLUSION : "exclusion",
    SUBTRACT : "blendSubtraction",
    DIVIDE : "blendDivide",
    HUE : "hue",
    SATURATION : "saturation",
    COLOR : "color",
    LUMINOSITY : "luminosity",
};