
/**
* Adds the default sharpening to web images
* @param {Number} amountPercent corresponds to "Amount" in photoshop
* @param {Number} radiusPixels corresponds to "Radius" in photoshop
* @param {Number} thresholdLevels corresponds to "Threshold" in photoshop
*/
this.UnsharpMask = function UnsharpMask(amountPercent, radiusPixels, thresholdLevels) 
{
    var idUnsM = s2t("unsharpMask");
    var desc38972 = new ActionDescriptor();
    var idAmnt = s2t("amount");
    var idPrc = s2t("percentUnit");
    desc38972.putUnitDouble(idAmnt, idPrc, amountPercent);
    var idRds = s2t("radius");
    var idPxl = s2t("pixelsUnit");
    desc38972.putUnitDouble(idRds, idPxl, radiusPixels);
    var idThsh = s2t("threshold");
    desc38972.putInteger(idThsh, thresholdLevels);
    executeAction(idUnsM, desc38972, DialogModes.NO);
}
