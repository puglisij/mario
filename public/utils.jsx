var _ = {
    getActiveDocumentPath: function() 
    {
        return app.activeDocument.fullName.fsName;
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
    restoreUnits: function() {}
}

function c2s(c) { return typeIDToStringID(charIDToTypeID(c)) }
function s2t(s) { return app.stringIDToTypeID(s) }
function c2t(c) { return app.charIDToTypeID(c) }