import exiftool from 'node-exiftool';
import upath from 'upath';
import uncSafePath from '../unc-safe-path';
import fs from 'fs';
import Image from './image';
import ImageSourceType from './imageSourceType';

export default class ImageFileReader
{
    /**
     * Create a reader used to generate an Image instance for processing by Adobe host
     */
    constructor() {}

    /**
     * Create a new Image instance for processing by Adobe host
     * @param {String} path the image path, json file path, document name (e.g. when using Active Document), or empty string. Path should be absolute
     * @param {ImageSource} imageSource the image source that produced the path 
     * @param {boolean} [readMetadata = false] whether to read the image files metadata (slower)
     */
    async read(path, imageSource, readMetadata = false)
    {
        let { useOutputDirectory, useProcessedDirectory, useErrorDirectory } = imageSource;
        let { outputDirectory, processedDirectory, errorDirectory } = imageSource;
        let initialInputImagePath = path || "";
        let inputImagePath = initialInputImagePath;
        let inputDirectory = this._isPathDefinedAndAbsolute(path) ? uncSafePath.dirname(path) : "";
        let data = {};
        let metadata = {};
        let pipelines = [];
        
        try 
        {
            if(this._isFile(inputImagePath)) 
            {
                if(this._isJsonFile(inputImagePath)) 
                {
                    data = await this._readJson(inputImagePath);
                    pipelines = data.pipelines || [];
                    // Grab new image source path and other paths from json, if available
                    inputImagePath = this._ensureAbsolutePath(data.inputImagePath, inputDirectory);
                    outputDirectory = this._ensureAbsolutePath(data.outputDirectory, inputDirectory);
                    processedDirectory = this._ensureAbsolutePath(data.processedDirectory, inputDirectory);
                    errorDirectory = this._ensureAbsolutePath(data.errorDirectory, inputDirectory);
                }
                if(this._isFile(inputImagePath) && readMetadata) 
                {
                    metadata = await this._readMetadata(inputImagePath);
                }
            }
        }
        catch(e) 
        {
            image.errors.push(e.toString());
        }
        finally 
        {
            useOutputDirectory = this._isDirectory(outputDirectory) ? useOutputDirectory : false;
            useProcessedDirectory = this._isDirectory(processedDirectory) ? useProcessedDirectory : false;
            useErrorDirectory = this._isDirectory(errorDirectory) ? useErrorDirectory : false;

            const image = new Image();
            image.initialInputImagePath = initialInputImagePath;
            image.inputImagePath = inputImagePath;        
            image.inputDirectory = inputDirectory;
            image.outputDirectory = useOutputDirectory ? outputDirectory : "";
            image.useOutputDirectory = useOutputDirectory;
            image.processedDirectory = useProcessedDirectory ? processedDirectory : "";
            image.useProcessedDirectory = useProcessedDirectory;
            image.errorDirectory = useErrorDirectory ? errorDirectory : "";
            image.useErrorDirectory = useErrorDirectory;
            image.data = data;
            image.metadata = metadata;
            image.pipelines = pipelines;

            return image;
        }
    }
    /**
     * Reads any json from the given data source, if it is json and it exists.
     * @returns {object}
     */
    async _readJson(jsonFilePath)
    {
        return new Promise(resolve => {
            fs.readFile(jsonFilePath, { encoding: 'utf8' }, (error, data) => {
                if(error) {
                    throw new Error(`Image json ${jsonFilePath} could not be read.`);
                }
                resolve(JSON.parse(data));
            });
        });
    }
    /**
     * Reads any metadata from the given source, if it is a file
     * @returns {object}
     */
    async _readMetadata(inputImagePath)
    {
        if(!this._isFile(inputImagePath)) {
            return Promise.resolve();
        }

        let ep = new exiftool.ExiftoolProcess();
        let processid = 0;

        return ep.open()
        .then(pid => {
            processid = pid;
        })
        .then(() => ep.readMetadata(inputImagePath, ['-File:all']))
        .then(metadata => {
            let fileMetadata = metadata.data[0];
            return fileMetadata;
        })
        .finally(() => {
            ep.close();
        });
    }
    _isPathDefinedAndAbsolute(path) {
        return typeof path === "string" && path.length > 0 && upath.isAbsolute(path);
    }
    _ensureAbsolutePath(path, parentDirectory) {
        if(!path) {
            return "";
        }
        return upath.isAbsolute(path) ? path : upath.join(parentDirectory, path);
    }
    _itExists(path) {
        return fs.existsSync(path || "");
    }
    _isJsonFile(path) {
        return upath.extname(path) === ".json";
    }
    _isFile(path) {
        try {
            return fs.lstatSync(path || "").isFile();
        } catch {
            return false;
        }
    }
    _isDirectory(path) {
        try {
            return fs.lstatSync(path || "").isDirectory();
        } catch {
            return false;
        }
    }
}