/**
* Convenience action to open the image given by "imagePath" property on the IMAGE instance
*/
action.openImagePath = function openImagePath()
{
    var imagePath = IMAGE.getImagePath();
    if(!imagePath) {
        throw new Error("IMAGE instance missing imagePath.");
    }
    return action.open(imagePath);
}