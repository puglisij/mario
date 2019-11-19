/**
* Changes the size of the active document image
* For method, BICUBIC is good for enlargement, BILINEAR is good for reduction
* @param {object} options 
* @param {string} options.w the width unit e.g. "300px" 
* @param {string} options.h the height unit  
* @param {ResampleMethod|String} [options.method = ResampleMethod.BILINEAR] the ResampleMethod enumeration value e.g. "BILINEAR"
*/
action.resizeImage = function resizeImage(options)
{
    if(options.method === undefined) {
        method = ResampleMethod.BILINEAR;
    } else {
        method = typeof(options.method) === "string" ? ResampleMethod[options.method.toUpperCase()] : options.method;
    }
    activeDocument.resizeImage(
        new UnitValue(options.w), 
        new UnitValue(options.h), 
        undefined,
        method
    );
}