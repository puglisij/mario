/**
* Creates the output directory for the IMAGE in process, if it does not exist already
* The created directory will be at:
*   <outputDirectory or ../Output>/<projectId or type>
*/
universal.createOutputDirectory = function createOutputDirectory() 
{
    var subDirectory = "" + IMAGE.data("projectId") || IMAGE.getType();
    var outputDirectoryRoot = IMAGE.data("outputDirectory") || activeDocument.path + "/../Output";
    var outputDirectory = new Folder(outputDirectoryRoot + "/" + subDirectory.toLowerCase());
    return action.createDirectory(outputDirectory);
};
