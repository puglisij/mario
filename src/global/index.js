import fs from 'fs';
import upath from 'upath';


const cs = new CSInterface();
const extensionPath = upath.normalize(cs.getSystemPath(SystemPath.EXTENSION));
const hostPath = upath.join(extensionPath, process.env.VUE_APP_HOST_DIR);
const hostActionPath = upath.join(hostPath, "actions");

export default {
    cs,
    extensionPath, 
    hostPath, 
    hostActionPath
}