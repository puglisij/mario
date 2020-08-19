/**
* Save the active document to the output directory. Created PSD does NOT become active document.
* See createOutputDirectory() for details on location.
* @param {string} [subDirectoryName] optional name of a subdirectory within the output directory
*/
action.universal.saveAsPSDToOutputDirectory = function saveAsPSDToOutputDirectory(subDirectoryName)
{
    var outputDirectory = action.universal.createOutputDirectory(subDirectoryName);
    var outputPsd = new File(outputDirectory.fullName + "/" + activeDocument.name);
    action.saveAsPSD(outputPsd);
};


