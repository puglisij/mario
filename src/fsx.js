import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import child_process from 'child_process';
import uncSafePath from './unc-safe-path';

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
 * Calls 'mkdir' through system command prompt. Succeeds if directory already exists.
 * This exists because { recursive: true } option not supported prior to Node v10.22
 * NOTE: When using 'recursive' option, call is delegated to shell command 'mkdir' and
 * any errors returned as a string
 * @param {string|Buffer|URL} dirPath 
 * @param {object} options 
 * @param {number} options.mode 
 * @param {boolean} [options.recursive = false]
 * @returns {Promise}
 */
function mkdir(dirPath, options) 
{
    return new Promise((resolve, reject) => {
        function cb(err) {
            if(err && err.code !== "ENOENT") reject(`${err}\nCould not create directory.`);
            else resolve(true);
        }
        options = typeof options === 'object' ? options : {};
        if(options.recursive) {
            _mkdirRecursive(dirPath, options, cb);
        } else {
            fs.mkdir.call(fs, dirPath, options, cb);
        }
    });
}
function _mkdirRecursive(dirPath, options, callback) 
{
    child_process.exec(
        `mkdir${options.mode ? ' --parents --mode=' + options.mode : ''} "${dirPath}"`, 
        { windowsHide : true },
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

/**
 * Move file/directory recursively to new destination, including across devices
 * If source file/directory actually doesn't exist, it will also be erased at the destination.
 * Uses system shell as this is a simpler alternative to Node for cross-drive cross-system moves. 
 * @param {string} from the absolute path to source file/directory (posix)
 * @param {string} to the absolute path to target directory. must be a directory (posix)
 * @returns {Promise}
 */
async function move(from, to) 
{
    let command = ``;
    let isWindows = process.platform.includes('win');
    if(isWindows) {
        // NOTE: robocopy will not copy source directory itself, nor will it create destination directory by the same name
        // NOTE: On windows cmd.exe all paths should use '\' and not '/'
        const stats = await stat(from);
        const isFromADirectory = stats.isDirectory();
        if(isFromADirectory) {
            // Move a directory
            const fromDir = from;
            const toDir = uncSafePath.remap(from, to, true);
            await mkdir(toDir);
            command = `robocopy ${path.normalize(fromDir)} ${path.normalize(toDir)} /E /IS /MOVE /PURGE /R:3`
        } else {
            // Move a file
            const file = path.basename(from);
            const fromDir = uncSafePath.dirname(from);
            const toDir = to;
            command = `robocopy ${path.normalize(fromDir)} ${path.normalize(toDir)} ${file} /IS /MOV /PURGE /R:3`
        }
    } else {
        command = `mv -f ${from} ${to}`;
    }

    return new Promise((resolve, reject) => {
        child_process.exec(command, { windowsHide : true },
            (error, stdout, stderr) => {
                // NOTE: code 1 is throwing false positives on Windows
                if(error && stdout.toString().includes("ERROR")) reject(error + '\n' + stdout);
                else resolve();
            }
        );
    });
} 

export default {
    rmdir,
    mkdir,
    move,
    append,
    createFile,
    createFileAndStatSize
}