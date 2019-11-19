function closeAll()
{
    while(app.documents.length)
    {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}

var action = {};
function importAction(actionFilePath)
{
    try { 
        var file = new File(actionFilePath).fsName; 
        $.evalFile(file); 
    } catch(e) { 
        alert("File: " + file + " Action Import Exception: " + e); 
    }
}


/*
    CSXSEvents can be received on the HTML Panel side using CSInterface
    https://www.davidebarranca.com/2014/07/html-panels-tips-11-externalobject-cep-events/
*/
function JsxEvents() {}
JsxEvents.isSupported = false;
JsxEvents.init = function() 
{
    // CSXSEvent is supported if PlugPlugExternalObject exists
    try {
        var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
        this.isSupported = !!xLib;
    } catch (e) {
        alert("xLib create failed: " + e);
    }
};
/**
* Dispatch event which can be received by Panel
*/
JsxEvents.dispatch = function(type, data) 
{
    if(!this.isSupported) {
        return;
    }
    try {
        var eventObj = new CSXSEvent();
            eventObj.type = type;
            eventObj.data = data || " ";
            eventObj.dispatch();
    } catch(e) {
        // fail
    }
};
JsxEvents.init();