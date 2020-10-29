/**
* Polyfil setTimeout (via host <-> client event magic)
* ExtendScript doesn't have a native setTimeout.
* NOTE: delay will be somewhat imprecise. 
*/
var execCallbacks = {};
var execId = 0;
this.exec = function(command, cb) {
    var id = execId++;
    execCallbacks[id] = cb;
    JsxEvents.dispatch("exec", id + "," + command);
};
this.executeExecCallback = function(id, stdout, stderr) {
    if(execCallbacks[id]) {
        execCallbacks[id](stdout, stderr);
        delete execCallbacks[id];
    }
};

/*
    CSXSEvents can be received on the HTML Panel side using CSInterface
    https://www.davidebarranca.com/2014/07/html-panels-tips-11-externalobject-cep-events/
*/
this.JsxEvents = function JsxEvents() {}
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
JsxEvents.dispatch = function(type, payload) 
{
    if(!this.isSupported) {
        return;
    }
    try {
        var data = JSON.stringify(payload);
        var eventObj = new CSXSEvent();
            eventObj.type = type;
            eventObj.data = data;
            eventObj.dispatch();
    } catch(e) {
        // fail
        alert(e);
    }
};
JsxEvents.init();