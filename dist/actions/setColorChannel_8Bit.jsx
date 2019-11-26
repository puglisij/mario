/**
* Set the color mode to 8 bits per channel
*/
action.setColorChannel_8Bit = function setColorChannel_8Bit()
{
    var idCnvM = charIDToTypeID("CnvM"); // convertMode
    var desc207 = new ActionDescriptor();
    var idDpth = charIDToTypeID("Dpth"); // depth
    desc207.putInteger(idDpth, 8);
    var idMrge = charIDToTypeID("Mrge"); // merge
    desc207.putBoolean(idMrge, false);
    executeAction(idCnvM, desc207, DialogModes.NO);
}