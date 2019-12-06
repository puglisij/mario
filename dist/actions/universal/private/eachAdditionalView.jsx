
/**
* Iterate and open each image path listed in IMAGE.data("packageImages")
* Each view becomes the active document.
* @param {function} cb the callback to execute for each additional view
*/
universal.private.eachAdditionalView = function eachAdditionalView(cb)
{
    var viewsDirectory = IMAGE.getPackagePath();
    var views = IMAGE.data("packageImages");
    if(!views) {
        throw new Error("Image data missing 'packageImages'.");
    }

    // For each Additional View in the data
    for(var i = 0; i < views.length; ++i) 
    {
        var view = views[i];
        var viewFile = new File(viewsDirectory + "/" + view.image);
        app.open(viewFile);

        cb(view);
    }
} 