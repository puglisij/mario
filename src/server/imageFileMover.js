import upath from 'upath';
import uncSafePath from '../unc-safe-path';
import fs from 'fs';
import rimraf from 'rimraf';
import Image from './image';


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
     * Moves the given Image instances and associated files to the given processed directory.
     * Also writes any errors to the output directory
     * @param {Array<Image>} images 
     */
    async move(images) 
    {
        for(const image of images)
        {
            if(image.errors.length) {
                if(image.useErrorDirectory) {
                    await this._moveImage(image, image.errorDirectory);
                }
                this._writeError(image, image.errorDirectory || image.inputDirectory, image.errors.join('\n'));
            } else if(image.useProcessedDirectory) {
                // TODO: Uncomment next line after Debugging
                await this._moveImage(image, image.processedDirectory);
            }
        }
    }
    /**
     * @param {Image} image 
     * @param {string} toDirectory target directory. Absolute or relative to input or data source path.
     */
    async _moveImage(image, toDirectory)
    {
        if(!upath.isAbsolute(toDirectory)) 
        {
            if(!image.inputDirectory) {
                console.log("Image not moved. Move directory was relative but input directory was not defined.");
                return Promise.resolve();
            } else {
                toDirectory = uncSafePath.join(image.inputDirectory, toDirectory);
            }
        }

        this._moveToDirectory(image, toDirectory);
    }
    _moveToDirectory(image, directory) 
    {
        const paths = this._getImagePaths(image);
        console.log(`Moving paths:\n\t${paths.join('\n\t')}\nTo directory\n\t${directory}`);

        for(const path of paths) 
        {
            const basename = upath.basename(path);
            const toPath = upath.join(directory, basename);
            move(path, toPath, err => {
                if(err) {
                    const message = err + "\nImage path could not be moved to " + toPath;
                    if(err.code == "ENOENT") {
                        console.log(message)
                    } else {
                        console.warn(message);
                    }
                }
            });
        }
    }
    _getImagePaths(image) 
    {
        const paths = [
            image.inputImagePath,
            (image.initialInputImagePath !== image.inputImagePath) ? image.initialInputImagePath : null
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
            `initialInputImagePath: ${image.initialInputImagePath}`, 
            `inputImagePath: ${image.inputImagePath}`, 
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