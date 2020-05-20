
/**
* Iterate and open each image path listed in IMAGE.data("inputImages")
* If IMAGE.data("inputImagePath") is defined, image paths should be relative to its parent directory.
* Each view becomes the active document.
* @param {function} cb the callback to execute for each additional view
*/
action.openEachImage = function openEachImage(cb)
{
    var viewsDirectory = IMAGE.getInputPath();
        viewsDirectory += viewsDirectory ? "/" : "";
    var views = IMAGE.data("inputImages");
    if(!views) {
        throw new Error("Image data missing 'inputImages'.");
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