import exiftool from 'node-exiftool';
import upath from 'upath';
import fs from 'fs';
import {promisify} from 'es6-promisify';

/**
 * Represents an Image being processed
 */
export default class Image 
{
    constructor() 
    {
        // the working/primary input image. For example, a template that will be built up using other images.
        this.imagePath = "";
        // the zip or folder location containing other images used in the image process
        this.packagePath = "";
        // the json data file for the image process
        this.dataPath = "";
        // the source directory where this process was picked up. This should be the 'watched' directory
        this.sourcePath = "";

        // default type or type mapped from data file
        this.type = "unknown";     // e.g. Product
        // External data (stored outside file) metadata necessary for processing
        this.data = {};     
        // Internal data (Metadata stored in the file)
        this.metadata = null; 
    }
    hasImagePath() {
        return !!this.imagePath;
    }
    hasPackagePath() {
        return !!this.packagePath;
    }
    hasDataPath() {
        return !!this.dataPath;
    }
    /**
     * Generate a path to store error messaging and files when an error occurs
     */
    getErrorDirectory() {
        return upath.join(this.sourcePath, "Error_" + this.type.toLowerCase());
    }
    /**
     * Generate a path to store files when this image process is complete
     */
    getProcessedDirectory() {
        return upath.join(this.sourcePath, "Processed_" + this.type.toLowerCase());
    }
    getAllFilePaths(toPath)
    {
        let files = [];
        if(this.hasImagePath()) {
            files.push(this.imagePath);
        }
        if(this.hasPackagePath()) {
            files.push(this.packagePath);
        }
        if(this.hasDataPath()) {
            files.push(this.dataPath);
        }
        return files;
    }
    
    static get Reader() 
    {
        class Reader
        {
            /**
             * Create an image Reader used to generate an Image instance. Reads image metadata, json, etc.
             * @param {String} sourcePath the source or root directory where files are read/written
             * @param {String} [filePath] the image or json file path. Optional
             * @param {Object} [defaultData] a default json data object with data necessary for processing
             */
            constructor(sourcePath, filePath, defaultData) 
            {
                this.image = new Image();
                this.image.data = defaultData || {};
                this.image.type = this.image.data.type || this.image.type;
                this.image.sourcePath = sourcePath;

                if(filePath)
                {
                    filePath = upath.normalize(filePath);
                    // Either an Image or JSON file
                    const dirName = upath.dirname(filePath);
                    const fileName = upath.basename(filePath);
                    const fileExtension = upath.extname(filePath);
                    const name = fileName.split('.')[0];

                    // TODO: Also support binary data using MessagePack standard for serialization?
                    if(fileExtension === ".json") {
                        this.image.dataPath = filePath;
                    } else {
                        this.image.dataPath = upath.join(dirName, name + '.json');
                        this.image.imagePath = filePath;
                    }
                }
            }
            /**
             * Read the given json or object as the 'data' for the image
             * @param {string|object} json 
             */
            async readProcessingDataFromJson(json)
            {
                this.image.data = json;
                if(!json) {
                    throw new Error("Cannot read json when empty.");
                }
                if(typeof json === "string") {
                    try {
                        this.image.data = JSON.parse(json);
                    } catch(e) {
                        console.error(e + `\nCould not parse json.`);
                    }
                }
                if (this.image.data.type) {
                    this.image.type = this.image.data.type;
                }
                // Don't override original image path
                if(this.image.data.image && !this.image.hasImagePath()) {
                    if(upath.isAbsolute(this.image.data.image)) {
                        this.image.imagePath = this.image.data.image;
                    } else {
                        this.image.imagePath = upath.join(this.image.sourcePath, this.image.data.image);
                    }
                }
                // TODO: Unpack if zip file
                if(this.image.data.package) {
                    if(upath.isAbsolute(this.image.data.package)) {
                        this.image.packagePath = this.image.data.package;
                    } else {
                        this.image.packagePath = upath.join(this.image.sourcePath, this.image.data.package);
                    }
                }
                return Promise.resolve();
            }
            async readProcessingData()
            {
                return new Promise(async (resolve, reject) => 
                {
                    // read data file, if available
                    try {
                        let rawJson = await promisify(fs.readFile)(this.image.dataPath, {
                            encoding: 'utf8'
                        });
                        this.readProcessingDataFromJson(rawJson);
                    } catch(e) {
                        this.image.dataPath = "";
                    }
                    resolve();
                });
            }
            /**
             * Reads any metadata from the image file at 'imagePath'
             * Should be called after either readProcessingDataFromJson() or readProcessingData()
             */
            async readMetadata()
            {
                if(!this.image.hasImagePath()) {
                    return;
                }

                let ep = new exiftool.ExiftoolProcess();
                let processid = 0;

                return ep.open()
                .then(pid => {
                    processid = pid;
                })
                .then(() => ep.readMetadata(this.image.imagePath, ['-File:all']))
                .then(metadata => {
                    let fileMetadata = metadata.data[0];
                    this.image.metadata = fileMetadata;
                })
                .finally(() => {
                    ep.close();
                });
            }
            getImage()
            {
                let image = this.image;
                this.image = null;
                return image;
            }
        }
        return Reader;
    }
}