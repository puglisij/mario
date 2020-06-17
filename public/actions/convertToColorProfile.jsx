/**
* Set the document to either "CMYK" or "RGB" color space. 
*/
action.convertToColorProfile = function convertToColorProfile(spaceType) 
{
    if(spaceType == "RGB") {
        assignRGBColorProfile();
    } else if(spaceType == "CMYK") {
        assignCMYKColorProfile();
    }

    function assignRGBColorProfile(){
        // Adobe RGB 1998
        // =======================================================
        var idconvertToProfile = stringIDToTypeID( "convertToProfile" );
        var desc1870 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref566 = new ActionReference();
        var idDcmn = charIDToTypeID( "Dcmn" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref566.putEnumerated( idDcmn, idOrdn, idTrgt );
        desc1870.putReference( idnull, ref566 );
        var idT = charIDToTypeID( "T   " );
        desc1870.putString( idT, "Adobe RGB (1998)" );
        var idInte = charIDToTypeID( "Inte" );
        var idInte = charIDToTypeID( "Inte" );
        var idClrm = charIDToTypeID( "Clrm" );
        desc1870.putEnumerated( idInte, idInte, idClrm );
        var idMpBl = charIDToTypeID( "MpBl" );
        desc1870.putBoolean( idMpBl, true );
        var idDthr = charIDToTypeID( "Dthr" );
        desc1870.putBoolean( idDthr, true );
        var idFltt = charIDToTypeID( "Fltt" );
        desc1870.putBoolean( idFltt, false );
        var idsdwM = charIDToTypeID( "sdwM" );
        desc1870.putInteger( idsdwM, 2 );
        executeAction( idconvertToProfile, desc1870, DialogModes.NO );
    }

    function assignCMYKColorProfile(){
        // US Web Coated (SWOP) v2
        // =======================================================
        var idconvertToProfile = stringIDToTypeID( "convertToProfile" );
        var desc53 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref10 = new ActionReference();
            var idDcmn = charIDToTypeID( "Dcmn" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref10.putEnumerated( idDcmn, idOrdn, idTrgt );
        desc53.putReference( idnull, ref10 );
        var idTMd = charIDToTypeID( "TMd " );
        var idCMYM = charIDToTypeID( "CMYM" );
        desc53.putClass( idTMd, idCMYM );
        var idInte = charIDToTypeID( "Inte" );
        var idInte = charIDToTypeID( "Inte" );
        var idClrm = charIDToTypeID( "Clrm" );
        desc53.putEnumerated( idInte, idInte, idClrm );
        var idMpBl = charIDToTypeID( "MpBl" );
        desc53.putBoolean( idMpBl, true );
        var idDthr = charIDToTypeID( "Dthr" );
        desc53.putBoolean( idDthr, true );
        var idFltt = charIDToTypeID( "Fltt" );
        desc53.putBoolean( idFltt, false );
        var idrasterizePlaced = stringIDToTypeID( "rasterizePlaced" );
        desc53.putBoolean( idrasterizePlaced, false );
        var idsdwM = charIDToTypeID( "sdwM" );
        desc53.putInteger( idsdwM, 2 );
        executeAction( idconvertToProfile, desc53, DialogModes.NO );
    }
}