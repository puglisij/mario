/**
* Toggle the ScriptListener plugin On/Off
* @param {bool} active true to turn ScriptListener On
*/
action.setScriptListenerActive = function setScriptListenerActive(active)
{
    var listenerID = stringIDToTypeID("AdobeScriptListener ScriptListener");
    var keyLogID = charIDToTypeID('Log ');
    var d = new ActionDescriptor;
    d.putBoolean(keyLogID, active);
    return executeAction(listenerID, d, DialogModes.NO);
}