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
            // Write errors if there are any
            await this._writeErrors(image);
            // Move input directory to processed Directory
            await this._moveInputDirectory(image);
            // Move working directory to outputDirectory
            await this._moveWorkingDirectory(image);
        }
        console.log(`Moves completed.`);
    }
    async _moveInputDirectory(image) 
    {
        const paths = this._getInputPaths(image);
        const toDirectory = image.errors.length > 0 ? image.errorDirectory : image.processedDirectory;
        if(toDirectory) {
            console.log(`Moving input paths:\n\t${paths.join('\n\t')}\nTo directory:\n\t${toDirectory}`);
            await this._moveToDirectory(paths, toDirectory);
        }
    }
    async _moveWorkingDirectory(image) 
    {
        if(!image.workingDirectory) {
            return;
        }
        // Assume workingDirectory + jobId is what's being written to on JSX side. See image.jsx
        const jobDirectory = upath.join(image.workingDirectory, image.jobId);
        const paths = [ jobDirectory ];
        if(image.errors.length > 0) {
            console.log(`Image processing errors. Removing working paths:\n\t${paths.join('\n\t')}`);
            await fsx.rmdir(jobDirectory, { recursive: true });
        } else {
            const toDirectory = image.outputDirectory || image.inputDirectory;
            console.log(`Moving working paths:\n\t${paths.join('\n\t')}\nTo directory:\n\t${toDirectory}`);
            await this._moveToDirectory(paths, toDirectory);
        }
    }
    _getInputPaths(image) 
    {
        const paths = [
            image.inputImagePath,
            (image.initialInputImagePath !== image.inputImagePath) ? image.initialInputImagePath : null
        ];
        return paths.filter(p => !!p); // remove empty paths
    }
    _moveToDirectory(paths, toDirectory) 
    {
        const promises = paths.map(path => {
            return fsx.move(path, toDirectory).catch(err => {
                console.error(err);
            });
        });
        return Promise.all(promises);
    }
    _writeErrors(image) 
    {
        if(image.errors.length == 0) {
            return;
        }
        const message = image.errors.join('\n').replace(/\n+$/, '');
        const directory = image.errorDirectory || image.inputDirectory;
        const logPath = upath.join(directory, "error.logs");
        const data = [
            `Time: ${new Date().toLocaleString()}`,
            `JobId: ${image.jobId}`,
            `initialInputImagePath: ${image.initialInputImagePath}`, 
            `inputImagePath: ${image.inputImagePath}`, 
            message,
            `-----\n`
        ].join(`\n`); 

        fsx.append(logPath, data)
        .catch(err => {
            console.error(err + "\nCould not write Image error to " + logPath + ". Error: ", data);
        });
    }
}