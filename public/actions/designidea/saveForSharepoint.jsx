/**
* Save design idea as a stupid simple JPG for export to Sharepoint
*/
action.designidea.saveForSharepoint = function saveForSharepoint() 
{
    action.openEachImage(function(view)
    {
        activeDocument.flatten();

        var w = activeDocument.width.as("px");
        var h = activeDocument.height.as("px"); 
        var aspect = w / h;

        if(h > 128) {
            action.resizeImage({
                w: "128px",
                constrain: true
            });
        }
        if(aspect > 3) {
            activeDocument.resizeCanvas(
                w + 256, 
                h, 
                AnchorPosition.MIDDLECENTER
            );
        }
        action.pause();

        var outputDirectory = action.universal.createOutputDirectory();
        action.saveForWeb({
            quality: 80, 
            file: outputDirectory
        });

        action.revert();
        action.closeDocumentWithoutSave();
    });
}