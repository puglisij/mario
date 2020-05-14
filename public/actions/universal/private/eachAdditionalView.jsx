
/**
* Iterate and open each image path listed in IMAGE.data("packageImages")
* If IMAGE.data("package") is defined, image paths should be relative to this directory.
* Each view becomes the active document.
* @param {function} cb the callback to execute for each additional view
*/
action.universal.private.eachAdditionalView = function eachAdditionalView(cb)
{
    var viewsDirectory = IMAGE.getInputPath();
        viewsDirectory += viewsDirectory ? "/" : "";
    var views = IMAGE.data("packageImages");
    if(!views) {
        throw new Error("Image data missing 'packageImages'.");
    }

    // For each Additional View in the data
    for(var i = 0; i < views.length; ++i) 
    {
        var view = views[i];
        var viewFile = new File(viewsDirectory + view.image);
        app.open(viewFile);

        cb(view);
    }
} 