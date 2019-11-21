/**
* Set the text of the note at the given index
*/
action.setNote = function setNote(noteIndex, text)
{
    var idsetd = charIDToTypeID( "setd" ); // set
    var desc235 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref40 = new ActionReference();
    var idannotation = stringIDToTypeID( "annotation" );
    ref40.putIndex( idannotation, noteIndex );
    desc235.putReference( idnull, ref40 );
    var idT = charIDToTypeID( "T   " ); // to
    var desc236 = new ActionDescriptor();
    var idTxtD = charIDToTypeID( "TxtD" ); // textData
    desc236.putData( idTxtD, text );
    var idtext = stringIDToTypeID( "text" );
    desc236.putString( idtext, text );
    var idannotation = stringIDToTypeID( "annotation" );
    desc235.putObject( idT, idannotation, desc236 );
    executeAction( idsetd, desc235, DialogModes.NO );
}