/**
* Scale layer based on percentage based on a ratio keyword
* @param {string|Number} [ratioKeyword] either "1to1" (scales by 58%), "4to1" (scales by 17%), or a number. Default is 29%
*/
this.ScaleLayerByRatio = function ScaleLayerByRatio(ratioKeyword)
{
    $.writeln("ScaleLayerByRatio()");

    var scalePercent = "29";
    if (_.hasKeyword("1to1")) {
        scalePercent = "58";
    }
    if (_.hasKeyword("4to1")) {
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
        desc3.putUnitDouble( idWdth, idPrc, sp );
        var idHght = s2t( "height" );
        var idPrc = s2t( "percentUnit" );
        desc3.putUnitDouble( idHght, idPrc, sp );
        var idLnkd = s2t( "linked" );
        desc3.putBoolean( idLnkd, true );
        executeAction( idTrnf, desc3, DialogModes.NO );
    } catch(err){}
}