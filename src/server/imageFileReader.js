import exiftool from 'node-exiftool';
import upath from 'upath';
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
     * @param {String} [imageInputSource] the image or json file path. Path should be absolute.
     */
    async read(imageInputSource)
    {
        if(!this._isPathDefinedAndAbsolute(imageInputSource)) {
            throw new Error("Image expected 'imageInputSource' to be an absolute path.");
        }

        const image = new Image();

        if(this._isFile(imageInputSource) && this._isJsonFile(imageInputSource)) 
        {
            const dataSource = imageInputSource;
            const data = await this._readJson(dataSource);
            const dataSourceDirectory = upath.dirname(dataSource);
            // Grab new image source path from json, if available
            imageInputSource = this._ensureAbsolutePath(data.imageInputSource, dataSourceDirectory);
            image.imageInputSource = imageInputSource;
            image.imageInputSourceDirectory = upath.dirname(imageInputSource);
            image.dataSource = dataSource;
            image.data = data;
        }

        if(this._isFile(imageInputSource)) {
            image.metadata = await this._readMetadata(imageInputSource);
        }

        return image;
    }
    /**
     * Reads any json from the given data source, if it is json and it exists.
     * @returns {object}
     */
    async _readJson(dataSource)
    {
        return new Promise(resolve => {
            fs.readFile(dataSource, { encoding: 'utf8' }, resolve);
        });
    }
    /**
     * Reads any metadata from the given source, if it is a file
     * @returns {object}
     */
    async _readMetadata(imageInputSource)
    {
        if(!this._isFile(imageInputSource)) {
            return Promise.resolve();
        }

        let ep = new exiftool.ExiftoolProcess();
        let processid = 0;

        return ep.open()
        .then(pid => {
            processid = pid;
        })
        .then(() => ep.readMetadata(imageInputSource, ['-File:all']))
        .then(metadata => {
            let fileMetadata = metadata.data[0];
            return fileMetadata;
        })
        .finally(() => {
            ep.close();
        });
    }
    _isPathDefinedAndAbsolute(path) {
        return typeof path === "string" && upath.isAbsolute(path);
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