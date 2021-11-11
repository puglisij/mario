import exiftool from 'node-exiftool';
import upath from 'upath';
import fs from 'fs';
import Image from './image';
import fsx from '../fsx';
import uncSafePath from '../unc-safe-path';
import _ from '../utils';



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
     * @param {Array<string>} targetPipelines
     */
    async read(path, imageSource, targetPipelines)
    {
        let { useOutputDirectory, useProcessedDirectory, useErrorDirectory } = imageSource;
        let { outputDirectory, processedDirectory, errorDirectory } = imageSource;
        let readMetadata = imageSource.readMetadata;

        // Sanity check
        outputDirectory = useOutputDirectory ? outputDirectory : "";
        processedDirectory = useProcessedDirectory ? processedDirectory : "";
        errorDirectory = useErrorDirectory ? errorDirectory : "";

        let initialInputImagePath = path || "";
        let inputImagePath = initialInputImagePath;
        let inputDirectory = this._isPathDefinedAndAbsolute(path) ? uncSafePath.dirname(path) : "";
        let pipelines = targetPipelines;
        let jobId = _.guid();
        let data = {};
        let metadata = {};
        let image = new Image();

        try 
        {
            if(this._doesFileExist(inputImagePath)) 
            {
                if(this._doesPathHaveJsonExtension(inputImagePath)) 
                {
                    data = await this._readJson(inputImagePath);
                    pipelines = data.pipelines || pipelines;
                    pipelines = (typeof pipelines === "string") ? pipelines.split(',') : pipelines;
                    readMetadata = (typeof data.readMetadata === "boolean") ? data.readMetadata : readMetadata;
                    jobId = data.jobId || jobId;

                    // Grab new image source path and other paths from json, if available
                    inputImagePath = data.inputImagePath || "";
                    outputDirectory = data.outputDirectory || outputDirectory;
                    processedDirectory = data.processedDirectory || processedDirectory;
                    errorDirectory = data.errorDirectory || errorDirectory;

                    inputImagePath = this._ensureAbsolutePath(inputImagePath, inputDirectory);
                    outputDirectory = this._ensureAbsolutePath(outputDirectory, inputDirectory);
                    processedDirectory = this._ensureAbsolutePath(processedDirectory, inputDirectory);
                    errorDirectory = this._ensureAbsolutePath(errorDirectory, inputDirectory);

                    useOutputDirectory = await this._makeDirectory(outputDirectory);
                    useProcessedDirectory = await this._makeDirectory(processedDirectory);
                    useErrorDirectory = await this._makeDirectory(errorDirectory);

                    // Blank paths if directory doesn't exist
                    outputDirectory = useOutputDirectory ? outputDirectory : "";
                    processedDirectory = useProcessedDirectory ? processedDirectory : "";
                    errorDirectory = useErrorDirectory ? errorDirectory : "";

                    if (uncSafePath.isAncestor(inputImagePath, inputDirectory) 
                        && (useProcessedDirectory || useErrorDirectory)) 
                    {
                        // Otherwise ImageFileMover would attempt to move the root/source directory
                        // This rule should probably be thrown inside of ImageFileMover
                        throw new Error(`JSON inputImagePath cannot be ancestor directory of or same as input directory when using errorDirectory or processedDirectory options.`);
                    }
                }
                if(this._doesFileExist(inputImagePath) && readMetadata === true) 
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
            image.jobId = jobId;
            image.initialInputImagePath = initialInputImagePath;
            image.inputImagePath = inputImagePath;        
            image.inputDirectory = inputDirectory;
            image.outputDirectory = outputDirectory;
            image.processedDirectory = processedDirectory;
            image.errorDirectory = errorDirectory;
            image.useOutputDirectory = useOutputDirectory;
            image.useProcessedDirectory = useProcessedDirectory;
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
        return new Promise((resolve, reject) => {
            fs.readFile(jsonFilePath, { encoding: 'utf8' }, (error, jsonString) => {
                if(error) {
                    reject(`Image json ${jsonFilePath} file could not be read.\n${error}`);
                    return;
                }
                try {
                    const data = JSON.parse(jsonString);
                    resolve(data);
                } catch(e) {
                    reject(e);
                }
            });
        });
    }
    /**
     * Reads any metadata from the given source, if it is a file
     * @returns {object}
     */
    async _readMetadata(inputImagePath)
    {
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
        return upath.isAbsolute(path) ? path : upath.resolve(parentDirectory, path);
    }
    _doesPathHaveJsonExtension(path) {
        return upath.extname(path) === ".json";
    }
    _doesFileExist(path) {
        try {
            return fs.lstatSync(path || "").isFile();
        } catch(e) {
            if(e && e.code == "ENOENT") {
                return false;
            } else {
                throw e;
            }
        }
    }
    _doesDirectoryExist(path) {
        try {
            return fs.lstatSync(path || "").isDirectory();
        } catch(e) {
            if(e && e.code == "ENOENT") {
                return false;
            } else {
                throw e;
            }
        }
    }
    _makeDirectory(directory) 
    {
        if(!directory) {
            return Promise.resolve(false);
        }
        return fsx.mkdir(directory, { recursive: true });
    }
}