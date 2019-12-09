/**
* Resize the active document canvas
* @param {UnitValue} options.w width
* @param {UnitValue} options.h height
* @param {string} options.anchorPosition See Adobe docs https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf
*/
action.resizeCanvas = function resizeCanvas(options)
{
    activeDocument.resizeCanvas(options.w, options.h, AnchorPosition[options.anchorPosition]);
}