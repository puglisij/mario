import upath from 'upath';
import envPaths from './envPaths';
import { version as marioAppVersion } from '../../package.json';


export default (function() 
{
    // Also see "process.versions"
    const csInterface = new CSInterface();
    const { appVersion, appName } = csInterface.getHostEnvironment();
    const { major, minor, micro } = csInterface.getCurrentApiVersion();
    const os = csInterface.getOSInformation()
    const env = envPaths("Mario");

    const installPath = csInterface.getSystemPath(SystemPath.EXTENSION);
    const appInstallPath = upath.normalize(installPath);
    const appWorkingPath = upath.join(appInstallPath, process.env.VUE_APP_HOST_DIR);
    const appDefaultLogPath = upath.normalize(env.log);
    const appDefaultConfigPath = upath.normalize(env.config);
    const appTempWorkingPath = upath.normalize(env.working);
    const appBuiltinActionsPath = upath.join(appWorkingPath, "actions");

    return {
        csInterface,
        os,
        appVersion: marioAppVersion,
        appInstallPath, 
        appWorkingPath,
        appDefaultLogPath,
        appDefaultConfigPath,
        appTempWorkingPath,
        appBuiltinActionsPath,
        adobeApp: appName,
        adobeVersion: appVersion, 
        adobeCEPApiVersion: `${major}.${minor}.${micro}`
    }
}());
