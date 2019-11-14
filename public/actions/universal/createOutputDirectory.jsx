/**
* Creates the output directory for the IMAGE in process, if it does not exist already
* The created directory will be at:
*   <outputDirectory or ../Output>/<projectId or type>
*/
action.createOutputDirectory = function createOutputDirectory() 
{
    var id = IMAGE.projectId || IMAGE.getType();
    var outputDirectoryRoot = IMAGE.get("outputDirectory") || "../Output";
    var outputDirectory = new Folder(outputDirectoryRoot + "/" + id);
    return action.createDirectory(outputDirectory);
};
