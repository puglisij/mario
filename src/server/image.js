import exiftool from 'node-exiftool';


export default class Image 
{
    constructor() 
    {
        this.type = "";     // e.g. Product
        this.metadata = null;
        this.keywords = [];
    }
    
    static get Reader() 
    {
        class Reader
        {
            constructor(path, fileName) {
                this.path = path;
                this.basename = fileName;
                this.image = new Image();
            }
            readWithClassifiers(classifiers) 
            {
                return new Promise((resolve, reject) => 
                {
                    for(const classifier of classifiers) 
                    {
                        try {
                            let result = classifier(this.basename);
                            if(result) {
                                this.image.type = result.type;
                                this.image.namemetadata = result;
                                resolve();
                            }
                        } catch(e) {
                            reject("Image classifier threw an exception: " + e);
                        }
                    }
                    reject("Image name could not be identified by classifier.");
                });
            }
            readMetadata()
            {
                let ep = new exiftool.ExiftoolProcess();
                let processid = 0;

                return ep.open()
                .then(pid => {
                    processid = pid;
                    console.log("Started exiftool process %s", pid);
                })
                .then(() => ep.readMetadata(this.path, ['-File:all']))
                .then(metadata => {
                    let fileMetadata = metadata.data[0];
                    this.image.metadata = fileMetadata;
                    this.image.keywords = fileMetadata.Keywords;
                })
                .finally(() => {
                    ep.close();
                    console.log("Closed exiftool %s", processid);
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