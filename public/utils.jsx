/**
* Shortcuts for work on the document
*/
var _ = {
    refresh: function()
    {
        if(app.refresh)
            app.refresh();
    }, 
    getDocumentPath: function() 
    {
        return app.activeDocument.fullName.fsName;
    },
    getDocumentNameWithoutExtension: function(fullName)
    {
        return (fullName || app.activeDocument.name).match(/^[^.]+/).toString();
    },
    saveUnits: function() 
    {
        var rulerUnits = app.preferences.rulerUnits;
        var typeUnits = app.preferences.typeUnits;
        var displayDialogs = app.displayDialogs;

        return function() {
            app.preferences.rulerUnits = rulerUnits;
            app.preferences.typeUnits = typeUnits;
            app.displayDialogs = displayDialogs;
        }
    },
    /**
    * Check active document for keyword. Case insensitive.
    */
    hasKeyword: function(keyword) 
    {
        keyword = keyword.toLowerCase();
        for (var i in activeDocument.info.keywords) {
            if ((activeDocument.info.keywords[i] + "").toLowerCase() == keyword) {
                return true;
            }
        }
        return false;
    },
    /**
    * Add the specified keyword to the document. Does not duplicate by default.
    * @param {bool} [allowDuplicates = false] true if multiple instances can exist (will not retroactively delete duplicate keywords)
    */
    addKeyword: function(keyword, allowDuplicates) 
    {
        if(allowDuplicates !== true && _.hasKeyword(keyword)) {
            return;
        }
        var keywords = activeDocument.info.keywords;
            keywords.push(keyword);
        activeDocument.info.keywords = keywords;
    },
    /**
    * Removes the layer with the given name, if found.
    */
    removeLayerByName: function(name)
    {
        try {
            var layer = activeDocument.artLayers.getByName(name);
            layer && layer.remove();
        } catch (err) {}
    },
    getLayerByName: function(name) 
    {
        try
        {
            var layer = activeDocument.artLayers.getByName(name);
            return layer;
        } catch(err) {}
        return null;
    },
    getPathByName: function(name) 
    {
        try {
            var pathItem = activeDocument.pathItems.getByName(name);
            return pathItem;
        } catch(err) {}
        return null;
    },
    /**
    * Replaces the mustache {{expression}} in the given text with the given input text
    * @param {string} template the template string e.g. "my template is {{foo}}"
    * @param {object} map the object with name, value pairs e.g. { foo: "awesome" }
    */
    mustache: function(template, map)
    {
        var result = [], t = 0;
        var tokens = template.split(/({{)|(}})/g);

        function nextToken() {
            var n = t + 1;
            while((typeof tokens[n] === undefined || tokens[n] === "{{") && n < tokens.length) { n += 1; }
            return tokens[t = n];
        }

        for(t = 0; t < tokens.length; ++t)
        {
            var token = tokens[t];
            if(token === "{{") {
                var key = nextToken().trim();
                if(key && map[key] !== undefined) {
                    if(nextToken() === "}}") {
                        result.push(map[key]);
                    }
                }
            } else if(token && token !== "}}") {
                result.push(token);
            }
        }
        return result.join('');
    }
}



function c2s(c) { return typeIDToStringID(charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }

/**
* Cross-platform path joining. Works similar to node.js  path.join(). 
* If path does not exist, the returned path may be invalid.
*/
// function pathJoin()
// {
//     if(!arguments.length) {
//         return null; 
//     }
//     function isPathAFile(path) {
//         return path.match(/\.[^\/:\\]+$/) !== null;
//     }
//     function makePathRelative(path) {
//         return "./" + path.replace(/^\.?[\/\\]/, '');
//     }
//     function makePathAbsolute(path) {
//         var f = new Folder(path);
//         return f.fsName;
//     }
//     var args = Array.prototype.slice.call(arguments);
//     var firstPart = args.shift();
//     if(!args.length) 
//     {
//         if(isPathAFile(firstPart)) {
//             return new File(firstPart);
//         } else {
//             return new Folder(firstPart);
//         }
//     }

//     firstPart = makePathAbsolute(firstPart);
//     var lastPart = makePathRelative(args.pop());
//     var currentDir = Folder.current;
//     Folder.current = new Folder(firstPart);

//     for(var i = 0; i < args.length; ++i) 
//     {
//         var pathPart = args[i];
//         if(typeof pathPart !== "string") {
//             throw new TypeError("Path must be a string. Received: " + pathPart);
//         }
//         pathPart = makePathRelative(pathPart);
//         Folder.current = new Folder(pathPart);
//     }
    
//     var result;
//     if(isPathAFile(lastPart)) {
//         result = new File(lastPart);
//     } else {
//         result = new Folder(lastPart);
//     }
//     // restore 
//     Folder.current = currentDir;
//     return result;
// }

/**
* Get JSON Introspection of an ActionDescriptor
* @param {ActionDescriptor} [actionDescriptor] if not specified, action descriptor for entire application is returned
*/
function actionDescriptorToJSON(actionDescriptor)
{
    if(!actionDescriptor) 
    {
        var r1 = new ActionReference();
            r1.putEnumerated(s2t("application"),
            s2t("ordinal"),
            s2t("targetEnum"));
        actionDescriptor = executeActionGet(r1);
    }
    var convertDesc = new ActionDescriptor();
    convertDesc.putObject( s2t("object"), s2t("object"), actionDescriptor );
    var jsonDesc = executeAction( s2t("convertJSONdescriptor"),
    convertDesc, DialogModes.NO );
    return jsonDesc.getString( s2t("json") );
}

"";