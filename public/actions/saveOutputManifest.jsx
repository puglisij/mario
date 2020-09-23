/**
* Saves an output manifest.json file. 
* This should be executed at the very end of a pipeline when all other processing is finished.
* NOTE: This will only output a manifest if files have been saved and paths have been registered to IMAGE
*/
action.saveOutputManifest = function saveOutputManifest()
{
    var savedFiles = IMAGE.getSavedFilePaths();
    if(!savedFiles.length) {
        return;
    }

    var outputDirectory = IMAGE.getOutputDirectory() || IMAGE.getInputDirectory() || IMAGE.getFirstSavedFileDirectory();
    var manifestData = {
        time: Date.now(),
        jobId: IMAGE.getJobId(),
        pipeline: IMAGE.getPipelineName(),
        initialInputImagePath: IMAGE.getInitialInputImagePath(),
        savedFiles: savedFiles,
        data: IMAGE.data(),
    };

    var json = JSON.stringify(manifestData);
    var file = new File(outputDirectory + "/manifest-" + IMAGE.getJobId() + ".json");
    // if (file.exists) {
    //     throw new Error("Manifest file " + file.name + " already exists.");
    // }
    file.encoding = "UTF8";
    file.open('w');
    file.write(json);
    file.close();
}