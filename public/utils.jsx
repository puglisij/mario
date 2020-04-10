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
    /**
    * Converts the given UnitValue to appropriate charID and Number values necessary to add to an ActionDescriptor
    * @param {Number|UnitValue} unitValue any type of supported unit: px, pt, pc, cm, mm, in, etc
    * @param {Number} [documentResolution] resolution of the reference document for this value, in pixels per inch. If no value is given, the activeDocument resolution is used.
    */
    unitValueToActionDescriptorValue: function(unitValue, documentResolution)
    {
        // Set reference Resolution (Document resolution is always in pixels per inch)
        var resolution = documentResolution || activeDocument.resolution;
        var originalBaseUnit = UnitValue.baseUnit; 
        UnitValue.baseUnit = UnitValue(1 / resolution, "in");

        var theUnit = UnitValue(unitValue);
        var result;
        if(theUnit.type == "px") {
            result = {
                value: theUnit.value, 
                charID: "#Pxl" // pixel 
            };
        } else if(theUnit.type == "%") {
            result = {
                value: theUnit.value, 
                charID: "#Prc" // percentUnit
            };
        } else {
            result = {
                value: theUnit.as("pt"), // Convert value to points ( which is inches / 72 )
                charID: "#Rlt" // distanceUnit (points)
            };
        }
        // Restore reference Resolution
        UnitValue.baseUnit = originalBaseUnit;
        return result;
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
    }, 
    isBoolean: function isBoolean(val) {
        return typeof val === "boolean";
    },
    isNumber: function isNumber(val) {
        return typeof val === "number" && val === val;
    },
    isObject: function isObject(val) {
        return val !== null && typeof(val) === "object" && !Array.isArray(val);
    },
    isEmptyObject: function isEmptyObject(obj) 
    {
        return Object.keys(obj || {}).length === 0;
    },
    isString: function isString(val) {
        return typeof val === "string";
    },
    isEmptyString: function isEmptyString(val) {
        return val === "";
    },
    isArray: function isArray(val) 
    {
        return Array.isArray(val)
    },
    isUndefined: function isUndefined(val) {
        return typeof val === "undefined";
    },
    isNull: function isNull(val) {
        return val === null;
    }
}

function c2s(c) { return app.typeIDToStringID(app.charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }
function t2s(t) { return app.typeIDToStringID(t) }

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

// Export as globals
this._ = _;
this.s2t = s2t;
this.c2t = c2t;
this.c2s = c2s;
this.t2s = t2s;
this.actionDescriptorToJSON = actionDescriptorToJSON;

"";
