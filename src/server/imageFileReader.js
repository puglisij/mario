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
     * @param {String} [imageInputSource] the image or json file path.
     * @param {Object} [defaultData] a default json data object with data necessary for processing
     */
    async read(imageInputSource, defaultData)
    {
        const image = new Image();
              image.data = defaultData || {};
              image.imageInputSource = imageInputSource || image.data.imageInputSource || "";

        if(this._itExists(source))
        {
            // TODO: Cleanup. Not a good practice to pass Image instance around.
            await this.readAvailableJson(image.imageInputSource, image);
            await this.readAvailableMetadata(image.imageInputSource, image)
        }   
        return image;
    }
    /**
     * Reads any json from the given data source, if it is json and it exists.
     */
    async readAvailableJson(dataSource, image)
    {
        return new Promise(resolve =>     
        {
            if(this._isJsonFile(dataSource)) 
            {
                fs.readFile(dataSource, { encoding: 'utf8' }, json => {
                    // Grab new image source path from json, if available
                    const sourceDirectory = upath.dirname(dataSource);
                    image.dataSource = dataSource;
                    image.data = Object.assign(image.data, json);
                    image.imageInputSource = ensureAbsolutePath(image.data.imageInputSource, sourceDirectory);
                });
            }
        });
    }
    /**
     * Reads any metadata from the given source, if it is a file
     */
    async readAvailableMetadata(imageInputSource, image)
    {
        if(!this._isFile(imageInputSource)) {
            return new Promise.resolve();
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
            image.metadata = fileMetadata;
        })
        .finally(() => {
            ep.close();
        });
    }

    ensureAbsolutePath(path, targetDirectory) {
        if(!path) {
            return "";
        }
        return upath.isAbsolute(path) ? path : upath.join(targetDirectory, path);
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