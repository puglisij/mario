this.MakeWhiteBackground = function MakeWhiteBackground() 
{
    var idMk = charIDToTypeID("Mk  ");
    var desc18 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref3 = new ActionReference();
    var idcontentLayer = stringIDToTypeID("contentLayer");
    ref3.putClass(idcontentLayer);
    desc18.putReference(idnull, ref3);
    var idUsng = charIDToTypeID("Usng");
    var desc19 = new ActionDescriptor();
    var idNm = charIDToTypeID("Nm  ");
    desc19.putString(idNm, """White""");
    var idType = charIDToTypeID("Type");
    var desc20 = new ActionDescriptor();
    var idClr = charIDToTypeID("Clr ");
    var desc21 = new ActionDescriptor();
    var idRd = charIDToTypeID("Rd  ");
    desc21.putDouble(idRd, 255.000000);
    var idGrn = charIDToTypeID("Grn ");
    desc21.putDouble(idGrn, 255.000000);
    var idBl = charIDToTypeID("Bl  ");
    desc21.putDouble(idBl, 255.000000);
    var idRGBC = charIDToTypeID("RGBC");
    desc20.putObject(idClr, idRGBC, desc21);
    var idsolidColorLayer = stringIDToTypeID("solidColorLayer");
    desc19.putObject(idType, idsolidColorLayer, desc20);
    var idcontentLayer = stringIDToTypeID("contentLayer");
    desc18.putObject(idUsng, idcontentLayer, desc19);
    executeAction(idMk, desc18, DialogModes.NO);

    // =======================================================
    var idmove = charIDToTypeID("move");
    var desc22 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref4 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref4.putEnumerated(idLyr, idOrdn, idTrgt);
    desc22.putReference(idnull, ref4);
    var idT = charIDToTypeID("T   ");
    var ref5 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idBack = charIDToTypeID("Back");
    ref5.putEnumerated(idLyr, idOrdn, idBack);
    desc22.putReference(idT, ref5);
    executeAction(idmove, desc22, DialogModes.NO);
    

    var idslct = charIDToTypeID("slct");
    var desc53 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref29 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idFrnt = charIDToTypeID("Frnt");
    ref29.putEnumerated(idLyr, idOrdn, idFrnt);
    desc53.putReference(idnull, ref29);
    var idMkVs = charIDToTypeID("MkVs");
    desc53.putBoolean(idMkVs, false);
    executeAction(idslct, desc53, DialogModes.NO);
}