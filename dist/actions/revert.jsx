/**
* Revert file back to original
*/
action.revert = function revert()
{
    // Is Revert slow?
    try{
        var idRvrt = charIDToTypeID( "Rvrt" );
        executeAction( idRvrt, undefined, DialogModes.NO );
    } catch(err){}
}