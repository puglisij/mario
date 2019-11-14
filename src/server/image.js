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
        return upath.join(this.getSourceDirectory(), "Error_" + this.type);
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
                this.image.data = defaultData;
                this.image.type = defaultData.type;

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
            async readProcessingData()
            {
                return new Promise(async (resolve, reject) => 
                {
                    // read data file, if available
                    try {
                        let rawJson = await promisify(fs.readFile)(this.image.dataPath, {
                            encoding: 'utf8'
                        });

                        this.image.data = JSON.parse(rawJson);
                        if (this.image.data.type) {
                            this.image.type = this.image.data.type;
                        }
                        if(this.image.data.image) {
                            if(this.image.hasImagePath()) {
                                console.log(`Watched image path ${this.image.imagePath} was overridden by data image path: ${this.image.data.image}`)
                            }
                            this.image.imagePath = this.image.data.image;
                        }
                        if(this.image.data.package) {
                            const sourceDir = this.image.getSourceDirectory();
                            this.image.packagePath = upath.join(sourceDir, this.image.data.package);
                            // TODO Unpack if zip file
                        }
                    } 
                    catch(e) {}
                    
                    resolve();
                });
            }
            async readMetadata()
            {
                if(!this.image.imagePath) {
                    return;
                }

                let ep = new exiftool.ExiftoolProcess();
                let processid = 0;

                return ep.open()
                .then(pid => {
                    processid = pid;
                })
                .then(() => ep.readMetadata(this.image.path, ['-File:all']))
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