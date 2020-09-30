import exiftool from 'node-exiftool';
import upath from 'upath';
import uncSafePath from '../unc-safe-path';
import fs from 'fs';
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
            const parentPath = upath.dirname(dirPath);
            mkdirp(parentPath, mode, callback);
            fs.mkdir(dirPath, mode, callback);
        } else {
            callback && callback(err);
        }
    });
}

export default class ImageFileReader
{
    /**
     * Create a reader used to generate an Image instance for processing by Adobe host
     */
    constructor() {}

    /**
     * Create a new Image instance for processing by Adobe host
     * NOTE: When 'path' is a json file, directories will be automatically created for output, processed, and error directories
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
        let image = new Image();

        try 
        {
            if(this._isFile(inputImagePath)) 
            {
                if(this._isJsonFile(inputImagePath)) 
                {
                    data = await this._readJson(inputImagePath);
                    pipelines = data.pipelines || [];
                    pipelines = (typeof pipelines === "string") ? pipelines.split(',') : pipelines;
                    
                    // Grab new image source path and other paths from json, if available
                    inputImagePath = this._ensureAbsolutePath(data.inputImagePath, inputDirectory);
                    outputDirectory = this._ensureAbsolutePath(data.outputDirectory, inputDirectory);
                    processedDirectory = this._ensureAbsolutePath(data.processedDirectory, inputDirectory);
                    errorDirectory = this._ensureAbsolutePath(data.errorDirectory, inputDirectory);
                    useOutputDirectory = await this._makeDirectory(outputDirectory);
                    useProcessedDirectory = await this._makeDirectory(processedDirectory);
                    useErrorDirectory = await this._makeDirectory(errorDirectory);
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
            image.initialInputImagePath = initialInputImagePath;
            image.inputImagePath = inputImagePath;        
            image.inputDirectory = inputDirectory;
            image.useOutputDirectory = useOutputDirectory;
            image.outputDirectory = useOutputDirectory ? outputDirectory : "";
            image.useProcessedDirectory = useProcessedDirectory;
            image.processedDirectory = useProcessedDirectory ? processedDirectory : "";
            image.useErrorDirectory = useErrorDirectory;
            image.errorDirectory = useErrorDirectory ? errorDirectory : "";
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
        return fs.lstatSync(path || "").isFile();
    }
    _isDirectory(path) {
        return fs.lstatSync(path || "").isDirectory();
    }
    _makeDirectory(directory) 
    {
        return new Promise((resolve, reject) => {
            if(!directory) {
                resolve(false);
                return;
            }
            mkdirp(directory, null, err => {
                if(err && err.code != "EEXIST") {
                    reject(err + "\nCould not create directory.");
                } else {
                    resolve(true);
                }
            });
        });
    }
}