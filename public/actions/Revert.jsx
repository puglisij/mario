/**
* Revert file back to original
*/
this.Revert = function Revert()
{
    try{
        var idRvrt = charIDToTypeID( "Rvrt" );
        executeAction( idRvrt, undefined, DialogModes.NO );
    } catch(err){}
}