import upath from 'upath';
import uncSafePath from '../unc-safe-path';
import fs from 'fs';
import rimraf from 'rimraf';
import Image from './image';

/**
 * Recursive directory creation. Same signature as fs.mkdir()
 * This exists because { recursive: true } option not supported prior to Node v10.22
 * @param {*} dirPath 
 * @param {*} mode 
 * @param {*} callback 
 */
function mkdirp(dirPath, mode, callback) 
{
    fs.mkdir(dirPath, mode, function(err) {
        if (err && err.code === 'ENOENT') {
            const parentPath = path.dirname(dirPath);
            mkdirp(parentPath, mode, callback);
            fs.mkdir(dirPath, mode, callback);
        } else {
            callback && callback(err);
        }
    });
}
/**
 * Force deletes the destination file/directory recursively and renames the source path to the destination
 * @param {*} fromPath 
 * @param {*} toPath 
 * @param {*} callback 
 */
function move(fromPath, toPath, callback)
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

export default class ImageFileMover 
{
    constructor() {}

    /**
     * Moves the Image and its associated files to the given processed directory.
     * Does nothing if Image does not contain any path values.
     * @param {Image} image 
     * @param {string} toDirectory target directory. Absolute or relative to input or data source path.
     * @param {string} [errorMessage] optional error message to write to error.logs
     */
    async move(image, toDirectory, errorMessage)
    {
        if(!toDirectory) {
            return Promise.resolve();
        }
        if(!upath.isAbsolute(toDirectory)) 
        {
            if(!image.inputDirectory) {
                console.log("Image not moved. Move directory was relative but input directory was not defined.");
                return Promise.resolve();
            } else {
                toDirectory = uncSafePath.join(image.inputDirectory, toDirectory);
            }
        }

        console.log("Moving file to directory: " + toDirectory);
        await this._makeDirectory(toDirectory);
        this._moveToDirectory(image, toDirectory);
        this._writeError(image, toDirectory, errorMessage);
    }
    _makeDirectory(directory) 
    {
        return new Promise((resolve, reject) => {
            mkdirp(directory, null, err => {
                if(err && err.code != "EEXIST") {
                    reject(err + "\nImage move failed. Could not create directory.");
                } else {
                    resolve();
                }
            });
        });
    }
    _moveToDirectory(image, directory) 
    {
        const paths = this._getImagePaths(image);
        for(const path of paths) 
        {
            const basename = upath.basename(path);
            const toPath = upath.join(directory, basename);
            move(path, toPath, err => {
                if(err) {
                    console.error(err + "\nImage path could not be moved to " + toPath);
                }
            });
        }
    }
    _getImagePaths(image) 
    {
        const paths = [
            image.inputImagePath,
            image.inputDataPath
        ];
        return paths.filter(p => !!p); // remove empty paths
    }
    _writeError(image, directory, message) 
    {
        if(!message) {
            return;
        }
        const logPath = upath.join(directory, "error.logs");
        fs.writeFile(logPath, [   
            `\n`,
            `Time: ${new Date().toLocaleString()}`,
            `inputImagePath: ${image.inputImagePath}`, 
            `inputDataPath: ${image.inputDataPath}`, 
            message
        ].join(`\n`), 
        {
            flag: 'a'
        },
        err => {
            if(err) 
                console.error(err + "\nCould not write Image error to " + logPath);
        });
    }
}