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
    getDefaultOutputPath: function() {
        if(!IMAGE) {
            throw new Error("No active IMAGE in process.");
        }
        return new Folder("../Output_" + IMAGE.type).fsName;
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
            if (activeDocument.info.keywords[i].toLowerCase() == keyword) {
                return true;
            }
        }
        return false;
    },
    /**
    * Add the specified keyword to the document
    * @param {bool} dontDuplicate true if only one instance should exist (will not retroactively delete duplicate keywords)
    */
    addKeyword: function(keyword, dontDuplicate) 
    {
        if(dontDuplicate && _.hasKeyword(keyword)) {
            return;
        }
        activeDocument.info.keywords.push(keyword);
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
    }
}



function c2s(c) { return typeIDToStringID(charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }

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