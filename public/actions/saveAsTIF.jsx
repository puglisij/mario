/**
* Saves the active document as a TIF. The created TIF becomes the active document
* @param {string|File} file full path or File instance
*/
action.saveAsTIF = function saveAsTIF(file)
{
    // TODO: Add boolean flag to make active document instead of active by default
    file = new File(file);
    IMAGE.addSavedFilePath(file.fsName);

    // layer compression | string id | jsx
    // RLE | "RLE" | s2t("RLE")
    // Zip | "zip" | s2t("zip")
    // Discard Layers and Save Copy | n/a | multiple lines

    // save current Document as a Tiff 
    var idsave = charIDToTypeID("save");
    var desc29 = new ActionDescriptor();
    var idAs = charIDToTypeID("As  ");
    var desc30 = new ActionDescriptor();
    var idBytO = charIDToTypeID("BytO"); // byteOrder
    var idPltf = charIDToTypeID("Pltf"); // platform
    var idIBMP = charIDToTypeID("IBMP"); // IBMPC
    desc30.putEnumerated(idBytO, idPltf, idIBMP);

    var idlayerCompression = stringIDToTypeID("layerCompression");
    var idEncd = charIDToTypeID("Encd"); // encoding
    var idRLE = stringIDToTypeID("RLE");
    desc30.putEnumerated(idlayerCompression, idEncd, idRLE);

    var idTIFF = charIDToTypeID("TIFF");
    desc29.putObject(idAs, idTIFF, desc30);
    var idIn = charIDToTypeID("In  "); // in
    desc29.putPath(idIn, file);

    // if(layerCompression == "DiscardLayers") 
    // {
    //     var idLyrs = charIDToTypeID( "Lyrs" ); // layers
    //     desc49.putBoolean( idLyrs, false );
    //     var idsaveStage = stringIDToTypeID( "saveStage" );
    //     var idsaveStageType = stringIDToTypeID( "saveStageType" );
    //     var idsaveSucceeded = stringIDToTypeID( "saveSucceeded" );
    //     desc49.putEnumerated( idsaveStage, idsaveStageType, idsaveSucceeded );
    //     executeAction( idsave, desc49, DialogModes.NO );
    // } else {
        var idLwCs = charIDToTypeID("LwCs"); // lowerCase
        desc29.putBoolean(idLwCs, true);
        executeAction(idsave, desc29, DialogModes.NO);
    // }
}
