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

        _.restoreUnits = function() {
            app.preferences.rulerUnits = rulerUnits;
            app.preferences.typeUnits = typeUnits;
            app.displayDialogs = displayDialogs;
        }
    },
    restoreUnits: function() {},
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
    }
}

function c2s(c) { return typeIDToStringID(charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }