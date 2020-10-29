import child_process from 'child_process';
import upath from 'upath';
import fs from 'fs';
import rimraf from 'rimraf';

/**
 * Force deletes the destination file/directory recursively and renames the source path to the destination
 * @param {*} fromPath 
 * @param {*} toPath 
 * @param {*} callback 
 */
function overwrite(fromPath, toPath, callback)
{
    rimraf(toPath, err => 
    {
        if(err) {
            callback(err);
            return;
        }
        fs.rename(fromPath, toPath, err => {
            callback(err);
        });
    });
}

/**
 * UNTESTED. Same as fs.rmdir except delegates to rimraf() when using recursive option
 * @param {*} path 
 * @param {*} options 
 * @param {*} cb 
 */
function rmdir(path, options, cb) 
{
    if(typeof options === 'object' && options.recursive) {
        rimraf(path, {
            maxBusyTries: options.maxRetries,
            emfileWait: retryDelay
        }, cb);
    } else {
        fs.rmdir.call(fs, arguments);
    }
}

/**
 * Same as fs.mkdir except supports options object and recursive option
 * This exists because { recursive: true } option not supported prior to Node v10.22
 * NOTE: When using 'recursive' option, call is delegated to shell command 'mkdir' and
 * any errors returned as a string
 * @param {string|Buffer|URL} dirPath 
 * @param {object} options 
 * @param {number} options.mode 
 * @param {boolean} options.recursive 
 * @param {function} callback 
 */
function mkdir(dirPath, options, callback) 
{
    if(typeof options === 'object' && options.recursive) {
        _mkdirRecursive(dirPath, options, callback);
    } else {
        fs.mkdir.call(fs, arguments);
    }
}
function _mkdirRecursive(dirPath, options, callback) 
{
    child_process.exec(
        `mkdir${options.mode ? ' --parents --mode=' + options.mode : ''} "${dirPath}"`, 
        (error, stdout, stderr) => {
            if(error) {
                // IMPORTANT: For some reason, on windows, when creating a directory 
                // on a mapped network drive, this command will both create the directory
                // AND throw an "already exists" error
                if(error.toString().toLowerCase().includes("already exists")) {
                    error.code = "ENOENT";
                }
                callback(error);
            } else {
                callback();
            }
        }
    );
} 


export default {
    rmdir,
    mkdir,
    overwrite
}