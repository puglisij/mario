/**
* Shortcuts for work on the document
*/
var _ = {
    refresh: function()
    {
        if(app.refresh)
            app.refresh();
    }, 
    /**
    * Returns true if path is a File
    * @param {string|Folder|File} path
    */
    isFile: function(path) {
        return File(path) instanceof File;
    },
    /**
    * Returns true if path is a Folder
    * @param {string|Folder|File} path
    */
    isFolder: function(path) {
        return Folder(path) instanceof Folder;
    },
    getDocumentPath: function() 
    {
        return app.activeDocument.fullName.fsName;
    },
    getDocumentNameWithoutExtension: function(fullName)
    {
        return (fullName || app.activeDocument.name).match(/^[^.]+/).toString();
    },
    getRulerUnitsAsAbbreviation: function() {
        switch(app.preferences.rulerUnits) {
            case Units.CM:
                return "cm";
            case Units.INCHES:
                return "in";
            case Units.MM:
                return "mm";
            case Units.PERCENT:
                return "%";
            case Units.PICAS:
                return "pc";
            case Units.PIXELS:
                return "px";
            case Units.POINTS:
                return "pt";
        }
        return "?";
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

        unitValue = _.isNumber(unitValue) ? unitValue + _.getRulerUnitsAsAbbreviation() : unitValue;
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
    /**
    * Convert the given value to a UnitValue instance. 
    * @param {string|Number|UnitValue} value if a Number, uses preference ruler units as the value Unit
    */
    toUnitValue: function(value) {
        var valueString = _.isNumber(value) ? value + _.getRulerUnitsAsAbbreviation() : value;
        return new UnitValue(valueString);
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
    * Returns the date in format YYYYMMDDhhmmss
    */
    yyyymmddhhmmss: function(date) 
    {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
        date = date || new Date();
        return date.getFullYear() +
               pad2(date.getMonth() + 1) + 
               pad2(date.getDate()) +
               pad2(date.getHours()) +
               pad2(date.getMinutes()) +
               pad2(date.getSeconds());
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
    },
    /**
    * The given value is believed to be an enumerated value under these conditions
    *   - its an object
    *   - does not have inherited properties
    *   - each property is of type (string, number, boolean)
    * Otherwise Returns false
    * TODO: doesnt yet work on Adobe built-in enums (e.g. AnchorPosition)
    */
    inferIsEnum: function(val) {
        if(typeof val !== "object") {
            return false;
        }

        var values = [];
        for(var p in val) {
            if(!val.hasOwnProperty(p)) {
                return false;
            }
            var pType = typeof val[p];
            if(!["string", "number", "boolean"].includes(pType)) {
                return false;
            }
            values.push(p);
        }
        return values;
    },
    clamp: function clamp(val, min, max) {
        return Math.max(min, Math.min(val, max));
    }
};

function c2s(c) { return app.typeIDToStringID(app.charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }
function t2s(t) { return app.typeIDToStringID(t) }
function t2c(t) { return app.typeIDToCharID(t) }


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
this.t2c = t2c;
this.actionDescriptorToJSON = actionDescriptorToJSON;

"";
