
export default class ImageSource
{
    /**
     * Configuration for sourcing new images for processing
     * @param {ImageSourceType} sourceType e.g. ImageSourceType.FILEWATCHER
     * @param {string} name a user friendly name for the image source 
     * @param {string} [sourceDirectory] 
     * @param {Array<string>} [sourceExtensions] file extensions allowed by this file source (without '.')
     * @param {boolean} [useWorkingDirectory = false]
     * @param {string} [workingDirectory = ""] directory where pipeline outputs will be written, the moved altogether to outputDirectory after processing, if no exceptions are thrown
     * @param {boolean} [useOutputDirectory = false]
     * @param {string} [outputDirectory] directory where pipeline outputs will be written
     * @param {boolean} [useProcessedDirectory = false]
     * @param {string} [processedDirectory] directory where source files will be moved to when finished processing
     * @param {boolean} [useErrorDirectory = false]
     * @param {string} [errorDirectory] directory where source files will be moved when an error is encountered
     * @param {boolean} [readMetadata = false]
     */
    constructor(
        sourceType, 
        name,
        sourceDirectory, 
        sourceExtensions, 
        useWorkingDirectory = false, 
        workingDirectory = "",
        useOutputDirectory = false, 
        outputDirectory = "", 
        useProcessedDirectory = false,
        processedDirectory = "", 
        useErrorDirectory = false,
        errorDirectory = "",
        readMetadata = false)
    {
        this.name = name;
        this.sourceType = sourceType;
        this.sourceDirectory = sourceDirectory;
        this.sourceExtensions = sourceExtensions;

        this.useWorkingDirectory = useWorkingDirectory;
        this.workingDirectory = workingDirectory;
        this.useOutputDirectory = useOutputDirectory;
        this.outputDirectory = outputDirectory;
        this.useProcessedDirectory = useProcessedDirectory;
        this.processedDirectory = processedDirectory;
        this.useErrorDirectory = useErrorDirectory;
        this.errorDirectory = errorDirectory;
        this.readMetadata = readMetadata;
    }

    clone() 
    {
        // Shallow copy
        let imageSource = new ImageSource();
        return Object.assign(imageSource, this);
    }
    toString() 
    {
        return `name = "${this.name}" type = ${this.sourceType} directory = "${this.sourceDirectory}"`;
    }

    static fromObject(object)
    {
        let imageSource = new ImageSource();
        for(const key of Object.getOwnPropertyNames(object)) {
            if(imageSource.hasOwnProperty(key)) {
                imageSource[key] = object[key];
            }
        }
        return imageSource;
    }
}
