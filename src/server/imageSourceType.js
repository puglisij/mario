import Enum from '../enum';

const ImageSourceType = new Enum([
    "OPENFILES", 
    "DIRECTORY", 
    "FILEWATCHER",
    "BLANK",
    "ACTIVEDOCUMENT",
    "REST"
]);

export default ImageSourceType