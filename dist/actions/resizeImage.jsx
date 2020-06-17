// /**
// * Changes the size of the active document image
// * For method, BICUBIC is good for enlargement, BILINEAR is good for reduction
// * @param {object} options 
// * @param {string} options.w the width unit e.g. "300px" 
// * @param {string} options.h the height unit  
// * @param {ResampleMethod|String} [options.method = ResampleMethod.BICUBIC] the ResampleMethod enumeration value e.g. "BILINEAR"
// */
// action.resizeImage = function resizeImage(options)
// {
//     if(options.method === undefined) {
//         var method = ResampleMethod.BICUBIC;
//     } else {
//         var method = typeof(options.method) === "string" ? ResampleMethod[options.method.toUpperCase()] : options.method;
//     }
//     activeDocument.resizeImage(
//         new UnitValue(options.w), 
//         new UnitValue(options.h), 
//         undefined,
//         method
//     );
// }
// NOTE: The native ExtendScript resizeImage() method above doesn't deal with layer shadows correcty. 

/**
* Changes the size of the active document image
* For method, BICUBIC is good for enlargement, BILINEAR is good for reduction
* @param {object} options 
* @param {string} options.w the width unit e.g. "300px" 
* @param {string} [options.h] the height unit. Defaults to width if not defined
* @param {bool} [options.constrain = true] true to constrain proportion aspect ratio
* @param {number} [options.resolution] the pixels per inch density. default is active document resolution
* @param {number} [options.reduceNoise] the integer percentage noise value for noise reduction (only valid for XResampleMethod.PRESERVEDETAILS and XResampleMethod.PRESERVEDETAILS2)
* @param {XResampleMethod|String} [options.method = XResampleMethod.BICUBICSMOOTHGRADIENTS] the resampling method enumeration value e.g. XResampleMethod.BILINEAR
*/
action.resizeImage = function resizeImage(options)
{
    var idImgS = charIDToTypeID( "ImgS" ); // imageSize
    var desc11 = new ActionDescriptor();

    // Parse/Calculate size units 
    var width = _.unitValueToActionDescriptorValue(options.w);
    var height = _.unitValueToActionDescriptorValue(options.h || options.w);

    var idWdth = charIDToTypeID( "Wdth" );
    var idPxl = charIDToTypeID( width.charID ); // pixel 
    desc11.putUnitDouble( idWdth, idPxl, width.value );
    var idHght = charIDToTypeID( "Hght" );
    var idPxl = charIDToTypeID( height.charID );
    desc11.putUnitDouble( idHght, idPxl, height.value );

    if(_.isUndefined(options.constrain) || options.constrain === true) {
        var idscaleStyles = stringIDToTypeID( "scaleStyles" );
        desc11.putBoolean( idscaleStyles, true );
        var idCnsP = charIDToTypeID( "CnsP" ); // constrainProportions
        desc11.putBoolean( idCnsP, true );
    }
    if(options.resolution) {
        var idRslt = charIDToTypeID( "Rslt" ); // resolution
        var idRsl = charIDToTypeID( "#Rsl" ); // densityUnit
        desc11.putUnitDouble( idRslt, idRsl, options.resolution );
    }

    var idIntr = charIDToTypeID( "Intr" ); // interfaceIconFrameDimmed
    var idIntp = charIDToTypeID( "Intp" ); // interpolationType
    var idInterpolation = options.method || XResampleMethod.BICUBICSMOOTHGRADIENTS;
    if(!_.isUndefined(options.reduceNoise) && (idInterpolation == XResampleMethod.PRESERVEDETAILS || idInterpolation.XResampleMethod.PRESERVEDETAILS2)) {
        var idNose = charIDToTypeID( "Nose" ); // noise
        desc11.putInteger( idNose, options.reduceNoise || 0 );
    }
    
    desc11.putEnumerated( idIntr, idIntp, idInterpolation );
    executeAction( idImgS, desc11, DialogModes.NO );
}

XResampleMethod = {
    AUTOMATIC: stringIDToTypeID( "automaticInterpolation" ),
    BICUBICSHARPER: stringIDToTypeID( "bicubicSharper" ),
    BICUBICSMOOTHER: stringIDToTypeID( "bicubicSmoother" ),
    BICUBICSMOOTHGRADIENTS: charIDToTypeID( "Bcbc" ),
    BILINEAR: charIDToTypeID( "Blnr" ),
    NEARESTNEIGHBOR: charIDToTypeID( "Nrst" ),
    PRESERVEDETAILS: stringIDToTypeID( "preserveDetailsUpscale" ),
    PRESERVEDETAILS2: stringIDToTypeID( "deepUpscale" )
};