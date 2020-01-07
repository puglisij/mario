/**
* Creates the output directory for the IMAGE in process, if it does not exist already
* The created directory will be at:
*   <outputDirectory or ../Output>/<projectId or type>
*/
universal.createOutputDirectory = function createOutputDirectory() 
{
    var subDirectory = "" + IMAGE.data("projectId") || IMAGE.getType();
    var outputDirectory = IMAGE.data("outputDirectory") || "../Output";
        outputDirectory = outputDirectory + "/" + subDirectory.toLowerCase()

    var currentDir = Folder.current;
    Folder.current = new Folder(IMAGE.getSourcePath());
    var folder = new Folder(outputDirectory);
    Folder.current = currentDir;

    return action.createDirectory(folder);
};
