import exiftool from 'node-exiftool';
import upath from 'upath';
import fs from 'fs';
import {promisify} from 'es6-promisify';

export default class Image 
{
    constructor() 
    {
        this.type = "unknown";     // e.g. Product
        this.fileName = "";
        this.path = "";
        // Path of the accompanying data file
        this.dataFileName = "";
        this.dataFilePath = ""; 
        // Path of the acompanying data folder (containing images needed for processing)
        this.dataFolderPath = "";
        // External (stored outside file) metadata necessary for processing
        this.data = {};     
        // Metadata stored in the file
        this.metadata = null; 
    }
    
    static get Reader() 
    {
        class Reader
        {
            constructor(path, fileName) 
            {
                this.image = new Image();
                this.image.fileName = fileName;
                this.image.path = path;
            }
            async readProcessingData()
            {
                return new Promise(async (resolve, reject) => 
                {
                    const directory = upath.dirname(this.image.path);
                    const name = this.image.fileName.split('.')[0];
                    const jsonFileName = name + '.json';
                    const binaryFileName = name + '.dat';
                    const pathFolder = upath.join(directory, name);
                    const pathJson = upath.join(directory, jsonFileName);
                    const pathBinary = upath.join(directory, binaryFileName); // Use MessagePack standard for serialization?

                    // read data file
                    let rawJson, data;
                    try {
                        rawJson = await promisify(fs.readFile)(pathJson, {
                            encoding: 'utf8'
                        });
                        // read data folder 
                        //stat = await promisify(fs.stat)(pathFolder);

                        this.image.dataFileName = jsonFileName;
                        this.image.dataFilePath = pathJson;
                        data = JSON.parse(rawJson);
                    } catch(e) {
                        reject(e);
                        return;
                    }
                    
                    if (!data.type) {
                        reject("Image data file missing type.");
                        return;
                    }
                    this.image.type = data.type.toLowerCase();
                    this.image.data = data;
                    resolve();
                });
            }
            async readMetadata()
            {
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