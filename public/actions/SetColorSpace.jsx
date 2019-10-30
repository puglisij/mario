/**
* Set the document to either "CMYK" or "RGB" color space. 
*/
action.setColorSpace = function setColorSpace(spaceType) 
{
    if(spaceType == "RGB") {
        assignRGBColorProfile();
    } else if(spaceType == "CMYK") {
        assignCMYKColorProfile();
    }

    function assignRGBColorProfile(){
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
        desc1870.putString( idT, """Adobe RGB (1998)""" );
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
        // =======================================================
        var idconvertToProfile = stringIDToTypeID( "convertToProfile" );
        var desc1868 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref564 = new ActionReference();
        var idDcmn = charIDToTypeID( "Dcmn" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref564.putEnumerated( idDcmn, idOrdn, idTrgt );
        desc1868.putReference( idnull, ref564 );
        var idTMd = charIDToTypeID( "TMd " );
        var idCMYM = charIDToTypeID( "CMYM" );
        desc1868.putClass( idTMd, idCMYM );
        var idInte = charIDToTypeID( "Inte" );
        var idInte = charIDToTypeID( "Inte" );
        var idClrm = charIDToTypeID( "Clrm" );
        desc1868.putEnumerated( idInte, idInte, idClrm );
        var idMpBl = charIDToTypeID( "MpBl" );
        desc1868.putBoolean( idMpBl, true );
        var idDthr = charIDToTypeID( "Dthr" );
        desc1868.putBoolean( idDthr, true );
        var idFltt = charIDToTypeID( "Fltt" );
        desc1868.putBoolean( idFltt, false );
        var idsdwM = charIDToTypeID( "sdwM" );
        desc1868.putInteger( idsdwM, 4 );
        executeAction( idconvertToProfile, desc1868, DialogModes.NO );
    }
}