
export default class ImageSource
{
    /**
     * Configuration for sourcing new images for processing
     * @param {ImageSourceType} sourceType e.g. ImageSourceType.FILEWATCHER
     * @param {string} name a user friendly name for the image source 
     * @param {string} [sourceDirectory] 
     * @param {Array<string>} [sourceExtensions] file extensions allowed by this file source (without '.')
     * @param {boolean} [useOutputDirectory = false]
     * @param {string} [outputDirectory] directory where pipeline outputs will be written
     * @param {boolean} [useProcessedDirectory = false]
     * @param {string} [processedDirectory] directory where source files will be moved to when finished processing
     * @param {boolean} [useErrorDirectory = false]
     * @param {string} [errorDirectory] directory where source files will be moved when an error is encountered
     */
    constructor(
        sourceType, 
        name,
        sourceDirectory, 
        sourceExtensions, 
        useOutputDirectory = false, 
        outputDirectory = "", 
        useProcessedDirectory = false,
        processedDirectory = "", 
        useErrorDirectory = false,
        errorDirectory = "")
    {
        this.name = name;
        this.sourceType = sourceType;
        this.sourceDirectory = sourceDirectory;
        this.sourceExtensions = sourceExtensions;

        this.useOutputDirectory = useOutputDirectory;
        this.outputDirectory = outputDirectory;
        this.useProcessedDirectory = useProcessedDirectory;
        this.processedDirectory = processedDirectory;
        this.useErrorDirectory = useErrorDirectory;
        this.errorDirectory = errorDirectory;
    }
}
