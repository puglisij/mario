import Enum from '../enum';

const ImageSourceType = new Enum([
    "OPENFILES", 
    "DIRECTORY", 
    "FILEWATCHER",
    "BLANK",
    "ACTIVEDOCUMENT"
]);

export default ImageSourceType