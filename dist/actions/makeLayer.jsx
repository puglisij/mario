/**
* Create a layer by the given name 
* @param {string} name the layer name. If not provided photoshop default is used.
*/
action.makeLayer = function makeLayer(name)
{
    // =======================================================
    var idMk = charIDToTypeID( "Mk  " ); // make
    var desc62 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref26 = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " ); // layer
    ref26.putClass( idLyr );
    desc62.putReference( idnull, ref26 );
    var idUsng = charIDToTypeID( "Usng" ); // using
    var desc63 = new ActionDescriptor();
    var idNm = charIDToTypeID( "Nm  " ); // name
    desc63.putString( idNm, name || "" );
    var idLyr = charIDToTypeID( "Lyr " ); // layer
    desc62.putObject( idUsng, idLyr, desc63 );
    executeAction( idMk, desc62, DialogModes.NO );
}