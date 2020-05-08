
/**
* Convenience action to open the image given by "imageInputSource" property on the IMAGE instance
*/
universal.openImageInputSource = function openImageInputSource()
{
    var path = IMAGE.getInputSource();
    if(!path) {
        throw new Error("IMAGE instance missing 'imageInputSource'.");
    }
    return action.open(path);
}