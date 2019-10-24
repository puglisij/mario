/**
* @param {string} anchorPosition See Adobe docs https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf
*/
this.ResizeCanvas = function ResizeCanvas(width, height, anchorPosition)
{
    activeDocument.resizeCanvas(width, height, AnchorPosition[anchorPosition]);
}