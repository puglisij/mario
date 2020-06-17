
/**
* Convenience action to open the image given by "inputImagePath" property on the IMAGE instance
* If path is a directory, does nothing
* If path is already open, it is set as the activeDocument
*/
action.openImage = function openImage()
{
    var path = IMAGE.getInputPath();
    if(!path) {
        throw new Error("IMAGE 'inputImagePath' is not defined.");
    }
    return action.open(path);
}