/**
* Crude method for determining whether the ScriptListener plugin is active (actively writing to logs file)
* Creates a 1px * 1px document and monitors existence of ~/Desktop/ScriptingListenerJS.log 
*/
action.getIsScriptListenerActive = function getIsScriptListenerActive()
{
    // Folder.desktop;
    function getLogs() {
        return new File('~/Desktop/ScriptingListenerJS.log');
    }
    function makeDocument() {
        var document = app.documents.add("1px", "1px", 1, "getIsScriptListenerActive");
        document.close(SaveOptions.SAVECHANGES);
    }
    var logsFile = getLogs();
    if (logsFile.exists()) {
        var initialLength = logsFile.length;
        makeDocument();
        return logsFile.length != initialLength;
    } else {
        makeDocument();
        return getLogs().exists();
    }
    
    return false;
};