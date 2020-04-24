function closeAll()
{
    while(app.documents.length)
    {
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}

function importJsx(jsxFilePath)
{
    try{ 
        var file = new File(jsxFilePath).fsName; 
        return $.evalFile(file); 
    } catch(e) {  
        alert("File: " + file + " Jsx Import Exception: " + e); 
    }
}

function importAction(actionFilePath, actionName)
{
    try { 
        var file = new File(actionFilePath).fsName; 
        $.evalFile(file); 
        wrapAction(actionName);
    } catch(e) { 
        alert("File: " + file + " Action Import Exception: " + e); 
    } 
}

/** 
 * Finds an action, by its fully qualified namespace, and wraps it so that the 
 * action name can be included in any exceptions generated. This somewhat replicates a stack trace.
 * @param {string} actionName action.foo.bar
*/
function wrapAction(actionName)
{
    var ns = actionName.split('.');
    var nameSpace = this;
    var methodName = ns[ns.length - 1];

    for(var i = 0; i < ns.length - 1; ++i) {
        nameSpace = nameSpace[ ns[i] ];
    }
    
    var originalMethod = nameSpace[methodName];
    if(!originalMethod) {
        throw new Error("Action " + actionName + " is undefined. Ensure that file name casing matches the function name.");
    }
    if(typeof originalMethod !== "function") {
        throw new Error("Action " + actionName + " is not a function.");
    }
    nameSpace[methodName] = function() {
        "use strict";
        try {
            return originalMethod.apply(nameSpace, arguments);
        } catch(e) {
            throw e 
                + (e.line !== undefined ? "\nLine Number: " + e.line  : "")
                + "\nAction: " + actionName;
        }
    };
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


function noop() {
    return true;
}