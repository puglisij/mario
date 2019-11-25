import exiftool from 'node-exiftool';
import upath from 'upath';
import fs from 'fs';
import {promisify} from 'es6-promisify';

export default class Image 
{
    constructor() 
    {
        // the working/primary input image
        this.imagePath = "";
        // the zip or folder location containing other images used in the pipeline
        this.packagePath = "";
        // the json data file for the image process
        this.dataPath = "";
        
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
    getErrorDirectory() {
        return upath.join(this.getSourceDirectory(), "Error_" + this.type.toLowerCase());
    }
    getProcessedDirectory() {
        return upath.join(this.getSourceDirectory(), "Processed_" + this.type.toLowerCase());
    }
    getSourceDirectory() {
        return upath.dirname(this.dataPath || this.imagePath);
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
            constructor(path, defaultData) 
            {
                this.image = new Image();
                this.image.data = defaultData || {};
                this.image.type = this.image.data.type || this.image.type;

                if(path)
                {
                    path = upath.normalize(path);
                    // Either an Image or JSON file
                    const dirName = upath.dirname(path);
                    const fileName = upath.basename(path);
                    const fileExtension = upath.extname(path);
                    const name = fileName.split('.')[0];

                    // TODO: Also support binary data using MessagePack standard for serialization?
                    if(fileExtension === ".json") {
                        this.image.dataPath = path;
                    } else {
                        this.image.dataPath = upath.join(dirName, name + '.json');
                        this.image.imagePath = path;
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
                if(typeof json === "string") {
                    try {
                        this.image.data = JSON.parse(json);
                    } catch(e) {
                        console.error(e + `\nCould not process image.`)
                    }
                }
                if (this.image.data.type) {
                    this.image.type = this.image.data.type;
                }
                // Don't override original image path
                if(this.image.data.image && !this.image.hasImagePath()) {
                    this.image.imagePath = upath.normalize(this.image.data.image);
                }
                // TODO: Unpack if zip file
                if(this.image.data.package) {
                    const sourceDir = this.image.getSourceDirectory();
                    this.image.packagePath = upath.join(sourceDir, this.image.data.package);
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