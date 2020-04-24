import upath from 'upath';


const appInstallPath = upath.normalize(new CSInterface().getSystemPath(SystemPath.EXTENSION));
const appWorkingPath = upath.join(appInstallPath, process.env.VUE_APP_HOST_DIR);
const appDefaultLogPath = upath.join(appWorkingPath, "logs");
const appBuiltinActionsPath = upath.join(appWorkingPath, "actions");

export default {
    appInstallPath, 
    appWorkingPath,
    appDefaultLogPath,
    appBuiltinActionsPath
}