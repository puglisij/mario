/**
* Set General Preferences option to "Resize image during place"
* @param {bool} isChecked true to toggle on
*/
action.setPreference_ResizeOnPaste = function setPreference_ResizeOnPaste(isChecked)
{
    var idsetd = charIDToTypeID( "setd" ); // set
	var desc249 = new ActionDescriptor();
	var idnull = charIDToTypeID( "null" );
	var ref186 = new ActionReference();
	var idPrpr = charIDToTypeID( "Prpr" ); // property
	var idGnrP = charIDToTypeID( "GnrP" ); // generalPreferences
	ref186.putProperty( idPrpr, idGnrP );
	var idcapp = charIDToTypeID( "capp" ); // application
	var idOrdn = charIDToTypeID( "Ordn" ); // ordinal
	var idTrgt = charIDToTypeID( "Trgt" ); // targetEnum
	ref186.putEnumerated( idcapp, idOrdn, idTrgt );
	desc249.putReference( idnull, ref186 );
	var idT = charIDToTypeID( "T   " ); // to
	var desc250 = new ActionDescriptor();
	var idresizePastePlace = stringIDToTypeID( "resizePastePlace" );
	desc250.putBoolean( idresizePastePlace, isChecked );
	var idGnrP = charIDToTypeID( "GnrP" ); // generalPreferences
	desc249.putObject( idT, idGnrP, desc250 );
	executeAction( idsetd, desc249, DialogModes.NO );
}