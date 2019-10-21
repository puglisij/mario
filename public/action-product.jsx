

//autoTemplateProduct
//-----------------------
_.saveUnits();
activeDocument.channels.removeAll();
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;

var newDocument = activeDocument.duplicate(_meta.basename);

var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
executeAction(idnewPlacedLayer, undefined, DialogModes.NO);

newDocument.activeLayer.name = newDocument.name.toString();
var idCnvS = s2t("canvasSize"); 
var desc3 = new ActionDescriptor();
var idWdth = s2t("width"); 
var idPxl = s2t("pixelsUnit"); 
desc3.putUnitDouble(idWdth, idPxl, 300.000000);
var idHght = s2t("height");
var idPxl = s2t("pixelsUnit");
desc3.putUnitDouble(idHght, idPxl, 300.000000);
var idHrzn = s2t("horizontal");
var idHrzL = s2t("horizontalLocation");
var idCntr = s2t("center");
desc3.putEnumerated(idHrzn, idHrzL, idCntr);
var idVrtc = s2t("vertical");
var idVrtL = s2t("verticalLocation");
var idCntr = s2t("center");
desc3.putEnumerated(idVrtc, idVrtL, idCntr);
executeAction(idCnvS, desc3, DialogModes.NO);

newDocument.trim(TrimType.TRANSPARENT);
scaleByRatio() 
shadow();
sharp();


//RGBProcessingActions
//-----------------------

//CMYKProcessingActions
//-----------------------


_.restoreUnits();

/*
    Post action:
    - Save as RGB colorspace to archives 
    - Save as CMYK colorspace to archives
*/

/*
    Functions
*/

/**
* Scale by percentage based on a ratio keyword
*/
function scaleByRatio() 
{
    $.writeln("sizeSharpenShadow function entered.");
    
    var scalePercent = "29";
    if (keywordCheck("1to1")) {
        scalePercent = "58";
    }
    if (keywordCheck("4to1")) {
        scalePercent = "17";
    }

    var sp = UnitValue(scalePercent, "%");
    try {
        var idTrnf = s2t( "transform" );
        var desc3 = new ActionDescriptor();
        var idFTcs = s2t( "freeTransformCenterState" );
        var idQCSt = s2t( "quadCenterState" );
        var idQcsa = s2t( "QCSAverage" );
        desc3.putEnumerated( idFTcs, idQCSt, idQcsa );
        var idOfst = s2t( "offset" );
        var desc4 = new ActionDescriptor();
        var idHrzn = s2t( "horizontal" );
        var idPxl = s2t( "pixelsUnit" );
        desc4.putUnitDouble( idHrzn, idPxl, 0.000000 );
        var idVrtc = s2t( "vertical" );
        var idPxl = s2t( "pixelsUnit" );
        desc4.putUnitDouble( idVrtc, idPxl, -0.000000 );
        var idOfst = s2t( "offset" );
        desc3.putObject( idOfst, idOfst, desc4 );
        var idWdth = s2t( "width" );
        var idPrc = s2t( "percentUnit" );
        desc3.putUnitDouble( idWdth, idPrc, scalePercent );
        var idHght = s2t( "height" );
        var idPrc = s2t( "percentUnit" );
        desc3.putUnitDouble( idHght, idPrc, scalePercent );
        var idLnkd = s2t( "linked" );
        desc3.putBoolean( idLnkd, true );
        executeAction( idTrnf, desc3, DialogModes.NO );
    } catch(err){}
}
/**
* Adds the default sharpening to web images
*/
function sharp() 
{
    var idUnsM = s2t("unsharpMask");
    var desc38972 = new ActionDescriptor();
    var idAmnt = s2t("amount");
    var idPrc = s2t("percentUnit");
    desc38972.putUnitDouble(idAmnt, idPrc, 40.000000);
    var idRds = s2t("radius");
    var idPxl = s2t("pixelsUnit");
    desc38972.putUnitDouble(idRds, idPxl, 0.400000);
    var idThsh = s2t("threshold");
    desc38972.putInteger(idThsh, 2);
    executeAction(idUnsM, desc38972, DialogModes.NO);
}

function shadow() 
{
    var idsetd = s2t("set");
    var desc217 = new ActionDescriptor();
    var idnull = s2t("null");
    var ref135 = new ActionReference();
    var idPrpr = s2t("property");
    var idLefx = s2t("layerEffects");
    ref135.putProperty(idPrpr, idLefx);
    var idLyr = s2t("layer");
    var idOrdn = s2t("ordinal");
    var idTrgt = s2t("targetEnum");
    ref135.putEnumerated(idLyr, idOrdn, idTrgt);
    desc217.putReference(idnull, ref135);
    var idT = s2t("to");
    var desc218 = new ActionDescriptor();
    var idScl = s2t("scale");
    var idPrc = s2t("percentUnit");
    desc218.putUnitDouble(idScl, idPrc, 100.000000);
    var idDrSh = s2t("dropShadow");
    var desc219 = new ActionDescriptor();
    var idenab = s2t("enabled");
    desc219.putBoolean(idenab, true);
    var idMd = s2t("mode");
    var idBlnM = s2t("blendMode");
    var idMltp = s2t("multiply");
    desc219.putEnumerated(idMd, idBlnM, idMltp);
    var idClr = s2t("color");
    var desc220 = new ActionDescriptor();
    var idRd = s2t("red");
    desc220.putDouble(idRd, 0.000000);
    var idGrn = s2t("green");
    desc220.putDouble(idGrn, 0.000000);
    var idBl = s2t("blue");
    desc220.putDouble(idBl, 0.000000);
    var idRGBC = s2t("RGBColor");
    desc219.putObject(idClr, idRGBC, desc220);
    var idOpct = s2t("opacity");
    var idPrc = s2t("percentUnit");
    desc219.putUnitDouble(idOpct, idPrc, 25.000000);
    var iduglg = s2t("useGlobalAngle");
    desc219.putBoolean(iduglg, false);
    var idlagl = s2t("localLightingAngle");
    var idAng = s2t("angleUnit");
    desc219.putUnitDouble(idlagl, idAng, 145.000000);
    var idDstn = s2t("distance");
    var idPxl = s2t("pixelsUnit");
    desc219.putUnitDouble(idDstn, idPxl, 2.000000);
    var idCkmt = s2t("chokeMatte");
    var idPxl = s2t("pixelsUnit");
    desc219.putUnitDouble(idCkmt, idPxl, 3.000000);
    var idblur = s2t("blur");
    var idPxl = s2t("pixelsUnit");
    desc219.putUnitDouble(idblur, idPxl, 3.000000);
    var idNose = s2t("noise");
    var idPrc = s2t("percentUnit");
    desc219.putUnitDouble(idNose, idPrc, 0.000000);
    var idAntA = s2t("antiAlias");
    desc219.putBoolean(idAntA, false);
    var idTrnS = s2t("transferSpec");
    var desc221 = new ActionDescriptor();
    var idNm = s2t("name");
    desc221.putString(idNm, "$$$/Contours/Defaults/Linear=Linear");
    var idCrv = s2t("curve");
    var list65 = new ActionList();
    var desc222 = new ActionDescriptor();
    var idHrzn = s2t("horizontal");
    desc222.putDouble(idHrzn, 0.000000);
    var idVrtc = s2t("vertical");
    desc222.putDouble(idVrtc, 0.000000);
    var idCrPt = s2t("curvePoint");
    list65.putObject(idCrPt, desc222);
    var desc223 = new ActionDescriptor();
    var idHrzn = s2t("horizontal");
    desc223.putDouble(idHrzn, 255.000000);
    var idVrtc = s2t("vertical");
    desc223.putDouble(idVrtc, 255.000000);
    var idCrPt = s2t("curvePoint");
    list65.putObject(idCrPt, desc223);
    desc221.putList(idCrv, list65);
    var idShpC = s2t("shapeCurveType");
    desc219.putObject(idTrnS, idShpC, desc221);
    var idlayerConceals = stringIDToTypeID("layerConceals");
    desc219.putBoolean(idlayerConceals, true);
    var idDrSh = s2t("dropShadow");
    desc218.putObject(idDrSh, idDrSh, desc219);
    var idLefx = s2t("layerEffects");
    desc217.putObject(idT, idLefx, desc218);
    executeAction(idsetd, desc217, DialogModes.NO);
}

