/**
* Scale the active image by the target scale
* Uses the 'currentScale' and 'targetScale' data properties
* @param {object} [options] 
* @param {ResampleMethod|string} [options.method] the resampling method to use
* @param {number} options.currentScale the current resolution (pixels per inch)
* @param {number} options.targetScale the target resolution (pixels per inch)
*/
action.universal.resizeImageByTargetScale = function resizeImageByTargetScale(options)
{
    var currentScale = options.currentScale;
    var targetScale = options.targetScale;

    if(typeof targetScale !== "number" || typeof currentScale !== "number") {
        throw new Error("Target scale and Current scale must be defined and must be numbers.");
    }
    if(targetScale > currentScale) {
        throw new Error("Target scale cannot be larger than current scale.");
    }
    if(currentScale == targetScale) {
        return;
    }
    
    // Dont scale below 0%
    var percentageScale = Math.max((targetScale / currentScale) * 100, 0);
    action.resizeImage({
            w: percentageScale + "%",
            h: percentageScale + "%", 
            method: options.method
        });
}