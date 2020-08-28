import exiftool from 'node-exiftool';
import upath from 'upath';
import uncSafePath from '../unc-safe-path';
import fs from 'fs';
import Image from './image';
import ImageSourceType from './imageSourceType';

export default class ImageFileReader
{
    /**
     * Create a reader used to generate an Image instance.
     * If a json file is read, data will be parsed and available on the resulting Image instance.
     */
    constructor() {}

    /**
     * Create a new Image instance, using the image or json file path, if given.
     * @param {String} [inputImagePath] the image or json file path. Path should be absolute unless it is an Open File in the Adobe application.
     * @param {String} [outputDirectory] 
     * @param {String} [processedDirectory]
     * @param {boolean} [readMetadata = false] whether to read the image files metadata (slower)
     */
    async read(path, outputDirectory = "", processedDirectory = "", readMetadata = false)
    {
        let inputImagePath = path || "";
        let inputDirectory = this._isPathDefinedAndAbsolute(path) ? uncSafePath.dirname(path) : "";
        let inputDataPath = "";
        let data = {};
        let metadata = {};
        let pipelines = [];
        if(this._isFile(inputImagePath)) 
        {
            if(this._isJsonFile(inputImagePath)) 
            {
                inputDataPath = inputImagePath;
                data = await this._readJson(inputDataPath);
                // Grab new image source path and other paths from json, if available
                inputImagePath = this._ensureAbsolutePath(data.inputImagePath, inputDirectory);
                outputDirectory = this._ensureAbsolutePath(data.outputDirectory, inputDirectory);
                processedDirectory = this._ensureAbsolutePath(data.processedDirectory, inputDirectory);
                pipelines = data.pipelines || [];
            }
            if(this._isFile(inputImagePath) && readMetadata) 
            {
                metadata = await this._readMetadata(inputImagePath);
            }
        }

        const image = new Image();
              image.inputImagePath = inputImagePath;        
              image.inputDataPath = inputDataPath;
              image.inputDirectory = inputDirectory;
              image.outputDirectory = outputDirectory;
              image.processedDirectory = processedDirectory;
              image.data = data;
              image.metadata = metadata;
              image.pipelines = pipelines;
        return image;
    }
    /**
     * Reads any json from the given data source, if it is json and it exists.
     * @returns {object}
     */
    async _readJson(inputDataPath)
    {
        return new Promise(resolve => {
            fs.readFile(inputDataPath, { encoding: 'utf8' }, (error, data) => {
                if(error) {
                    throw new Error(`Image json ${inputDataPath} could not be read.`);
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
}