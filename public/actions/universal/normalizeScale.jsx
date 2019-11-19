/**
* Scale the active image in order to normalize viewing size for print or web
*/
action.normalizeScale = function normalizeScale(options)
{
    var currentScale = options.currentScale || IMAGE.data("currentScale");
    var targetScale = options.targetScale || IMAGE.data("targetScale");
    if(targetScale > currentScale) {
        throw new Error("Target scale cannot be larger than current scale.");
    }
    // ...
}