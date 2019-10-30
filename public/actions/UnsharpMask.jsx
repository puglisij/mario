
/**
* Adds the default sharpening to web images
* @param {object} options an object with options affecting the mask
* @param {Number} [options.amountPercent] corresponds to "Amount" in photoshop
* @param {Number} [options.radiusPixels] corresponds to "Radius" in photoshop
* @param {Number} [options.thresholdLevels] corresponds to "Threshold" in photoshop
*/
action.unsharpMask = function unsharpMask(options) 
{
    var idUnsM = s2t("unsharpMask");
    var desc38972 = new ActionDescriptor();
    var idAmnt = s2t("amount");
    var idPrc = s2t("percentUnit");
    desc38972.putUnitDouble(idAmnt, idPrc, options.amountPercent);
    var idRds = s2t("radius");
    var idPxl = s2t("pixelsUnit");
    desc38972.putUnitDouble(idRds, idPxl, options.radiusPixels);
    var idThsh = s2t("threshold");
    desc38972.putInteger(idThsh, options.thresholdLevels);
    executeAction(idUnsM, desc38972, DialogModes.NO);
}
