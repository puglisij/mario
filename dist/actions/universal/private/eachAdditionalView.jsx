
/**
* Iterate and open each image path listed in IMAGE.data("packageViews")
* Each view becomes the active document.
* @param {function} cb the callback to execute for each additional view
*/
universal.private.eachAdditionalView = function eachAdditionalView(cb)
{
    var viewsDirectory = IMAGE.getPackagePath();
    var views = IMAGE.data("packageViews");
    if(!views) {
        throw new Error("Image data missing 'packageViews'.");
    }

    // For each Additional View in the data
    for(var i = 0; i < views.length; ++i) 
    {
        var view = views[i];
        var viewIsFromArchives = view.isFromArchives;
        var viewFile = new File(viewsDirectory + "/" + view.file);
        app.open(viewFile);

        cb(view);
    }
} 