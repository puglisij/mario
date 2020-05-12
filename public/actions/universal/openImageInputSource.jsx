
/**
* Convenience action to open the image given by "imageInputSource" property on the IMAGE instance
*/
universal.openImageInputSource = function openImageInputSource()
{
    var path = IMAGE.getInputSource();
    if(!path) {
        throw new Error("IMAGE 'imageInputSource' is not defined.");
    }
    return action.open(path);
}