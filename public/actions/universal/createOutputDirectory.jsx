/**
* Creates the output directory for the IMAGE in process. 
* If IMAGE.outputDirectory is undefined, the default is used. 
*/
action.createOutputDirectory = function createOutputDirectory() 
{
    var outputDirectory = IMAGE.get("outputDirectory") || _.getDefaultOutputPath();
    action.createDirectory(outputDirectory);
    return outputDirectory;
};