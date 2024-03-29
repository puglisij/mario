
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
            // Also see $.stack
        }
    };
}


function noop() {
    return true;
}