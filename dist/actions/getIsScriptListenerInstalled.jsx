/**
* Returns true if ScriptListener is found in system info. 
*/
action.getIsScriptListenerInstalled = function getIsScriptListenerInstalled()
{
    var ref = new ActionReference ();
    ref.putProperty (s2t ("property"), s2t ("systemInfo"));
    ref.putEnumerated (s2t ("application"), s2t ("ordinal"), s2t ("targetEnum"));
    var descriptor = executeActionGet (ref);
    var systemInfo = descriptor.getString(s2t ("systemInfo"));
    var isInstalled = systemInfo.indexOf("ScriptListener") !== -1;
    return isInstalled;
}