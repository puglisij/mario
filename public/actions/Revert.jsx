/**
* Revert file back to original
*/
action.revert = function revert()
{
    try{
        var idRvrt = charIDToTypeID( "Rvrt" );
        executeAction( idRvrt, undefined, DialogModes.NO );
    } catch(err){}
}