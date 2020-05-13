import upath from 'upath';
import fs from 'fs';
import Image from './image';

export default class ImageFileMover 
{
    constructor() {}

    /**
     * Moves the Image and its associated files to the given processed directory.
     * Does nothing if Image does not contain any path values.
     * @param {Image} image 
     * @param {string} processedDirectory path to target directory. Absolute or relative to input or data source path.
     */
    moveToProcessed(image, processedDirectory)
    {
        console.log("Moving file to processed directory: " + processedDirectory);
        this._moveToDirectory(image, processedDirectory);
    }
    moveToErrored(image, erroredDirectory, errorMessage)
    {
        console.log("Moving file to errored directory.");
        this._moveToDirectory(image, erroredDirectory);
        this._writeError(erroredDirectory, errorMessage);
    }
    async _moveToDirectory(image, directory) 
    {
        if(!directory) {
            return;
        }
        if(!upath.isAbsolute(directory)) {
            const sourceDirectory = this._getImageInputDirectory(image);
            if(!sourceDirectory) {
                console.log("Image not moved. Move directory was relative but input directory was not defined.");
                return;
            } else {
                directory = upath.join(sourceDirectory, directory);
            }
        }

        const paths = this._getImagePaths(image);
        if(!paths) {
            return;
        }

        await this._makeDirectory(directory);
        for(const path of paths) 
        {
            const basename = upath.basename(path);
            const toPath = upath.join(directory, basename);
            fs.rename(path, toPath, err => {
                if(err) 
                    console.error(err + "\nImage path could not be moved to " + toPath);
            });
        }
    }
    _writeError(image, directory, message) 
    {
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
    _getImageInputDirectory(image)
    {
        return image.inputDirectory;
    }
    _getImagePaths(image) 
    {
        const paths = [
            image.inputImagePath,
            image.inputDataPath
        ];
        return paths.filter(p => !!p); // remove empty paths
    }
    _makeDirectory(directory) 
    {
        return new Promise(resolve => {
            fs.mkdir(directory, { recursive: true }, err => {
                if(err && !err.code == "EEXIST") 
                    console.error(err + "\nImage move failed. Could not create directory " + directory);
                resolve();
            });
        });
    }
    
}