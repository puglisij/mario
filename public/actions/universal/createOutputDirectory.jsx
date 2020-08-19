/**
* Creates the output directory for the IMAGE in process, if it does not exist already
* The created directory will be at:
*   <outputDirectory or ../Output>/<projectId or type>
*/
action.universal.createOutputDirectory = function createOutputDirectory(subDirectoryName) 
{
    var outputDirectory = IMAGE.data("outputDirectory") || "./Output";
        outputDirectory = outputDirectory + "/" + (subDirectoryName || "")

    var currentDir = Folder.current;
    Folder.current = new Folder(IMAGE.getInputDirectory());
    var folder = new Folder(outputDirectory);
    Folder.current = currentDir;

    return action.createDirectory(folder);
};
