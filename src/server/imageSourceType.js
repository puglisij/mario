import Enum from '../enum';

const ImageSourceType = new Enum([
    "OPENFILES", 
    "DIRECTORY", 
    "FILEWATCHER",
    "BLANK"
]);

export default ImageSourceType