
function importJsx(jsxFilePath)
{
    try{ 
        var file = new File(jsxFilePath).fsName; 
        return $.evalFile(file); 
    } catch(e) {  
        alert("File: " + file + " Jsx Import Exception: " + e); 
    }
}


/** 
 * Wraps the given function such that a rudimentary stack trace is provided in case of an exception
 * @param {object} context the object on which the function is defined
 * @param {function} fn the function to be wrapped
*/
function wrapFunction(context, fn)
{
    return function() {
        "use strict";
        try {
            return fn.apply(context, arguments);
        } catch(e) {
            throw e 
                + (e.line !== undefined ? "\nLine Number: " + e.line  : "")
                + "\nFunction: " + actionName;
            // Also see $.stack
        }
    };
}


function noop() {
    return true;
}