import child_process from 'child_process';
import upath from 'upath';
import fs from 'fs';
import rimraf from 'rimraf';

/**
 * Appends the given string to the file at the given path.
 * This is a workaround, alternative to fs.appendFile which does not work on network AFS drives.
 * Creates the file if it doesn't exist.
 * Its not safe to append multiple times without waiting for the promise to resolve.
 * Use a file stream for more frequent writes.
 * @param {string} path 
 * @param {string} str 
 * @returns {Promise} promise resolves with the following arguments (err)
 */
function append(path, str) 
{
    return createFileAndStatSize(path)
    .then(position => {
        return writeAtPosition(path, str, position);
    });
}

function writeAtPosition(path, str, position) 
{
    return new Promise((resolve, reject) => 
    {
        fs.open(path, 'r+', (err, fd) => 
        {
            if(err) {
                return reject(err);
            } 

            const buffer = Buffer.from(str, 'utf8');
            fs.write(fd, buffer, 0, buffer.length, position, (err) => 
            {
                fs.closeSync(fd);
                
                if(err) 
                    reject(err);
                else
                    resolve();
            });
        })
    });
}

/**
 * Create the file at the given path if it doesnt exist and return its byte size.
 * @param {string} path 
 */
function createFileAndStatSize(path) 
{
    return stat(path)
    .then(stats => {
        if(stats) {
            return stats.size;
        } else {
            return createFile(path).then(_ => 0);
        }
    });
}

/**
 * Creates the file at the given path if it doesn't exist.
 * Truncates the file if it exists.
 * @param {string} path 
 */
function createFile(path)
{
    return new Promise((resolve, reject) => {
        fs.open(path, 'w+', (err, fd) => {
            fs.closeSync(fd);

            if(err) 
                reject(err);
            else 
                resolve(); 
        });
    });
}

/**
 * Promisified wrapper for fs.stat()
 * @param {string} path 
 */
function stat(path) 
{
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if(err && err.code !== 'ENOENT') 
                return reject(err);
            
            resolve(stats);
        });
    });
}

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
    overwrite,
    append
}