import upath from 'upath';
import fs from 'fs';
import fsx from '../fsx';
import Image from './image';

export default class ImageFileMover 
{
    constructor() {
    }

    /**
     * Moves the given Image instances and associated files to the given processed directory.
     * Also writes any errors to the output directory
     * @param {Array<Image>} images 
     */
    async move(images) 
    {
        console.log(`Moving ${images.length} processed images...`);
        for(const image of images)
        {
            if(image.errors.length) {
                const errorDirectory = image.errorDirectory || image.inputDirectory;
                if(errorDirectory) {
                    this._writeError(image, errorDirectory, image.errors.join('\n'));
                }
                if(image.useErrorDirectory) {
                    await this._moveImage(image, image.errorDirectory);
                } else {
                    console.log(`Move skipped for errored image : ${image.jobId}. No error directory defined.`);
                }
            } else if(image.useProcessedDirectory) {
                // TODO: Uncomment next line after Debugging
                await this._moveImage(image, image.processedDirectory);
            }
        }
        console.log(`Moves completed.`);
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
                console.error("Image not moved. Move directory was relative but input directory was not defined.");
                return Promise.resolve();
            } else {
                toDirectory = upath.join(image.inputDirectory, toDirectory);
            }
        }

        await this._moveToDirectory(image, toDirectory).catch(err => {
            const message = err + "\nImage path could not be moved.";
            console.warn(message);
        });
    }
    _moveToDirectory(image, directory) 
    {
        const paths = this._getImagePaths(image);
        console.log(`Moving paths:\n\t${paths.join('\n\t')}\nTo directory\n\t${directory}`);

        const promises = paths.map(path => {
            return fsx.move(path, directory);
        });
        return Promise.all(promises);
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
        const data = [   
            `\n`,
            `Time: ${new Date().toLocaleString()}`,
            `initialInputImagePath: ${image.initialInputImagePath}`, 
            `inputImagePath: ${image.inputImagePath}`, 
            message
        ].join(`\n`);

        fsx.append(logPath, data)
        .catch(err => {
            console.error(err + "\nCould not write Image error to " + logPath);
        });
    }
}