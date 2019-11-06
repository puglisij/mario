// TODO Use Rete.js ? 

class PipelineEditor
{
    constructor(rootEl)
    {
        this.rootEl = rootEl;
    }
    _addNode(type)
    {

    }
    _removeNode(id)
    {

    }
    _addConnection(socketA, socketB)
    {

    }
    _drawConnection(fromEl, toEl) 
    {
        const fromBounds = fromEl.getBoundingClientRect();
        const toBounds = toEl.getBoundingClientRect();
        // mid points
        const from = [
            fromBounds.x - window.scrollX + fromBounds.width * 0.5, 
            fromBounds.y - window.scrollY + fromBounds.height * 0.5];
        const to = [
            toBounds.x - window.scrollX + toBounds.width * 0.5, 
            toBounds.y - window.scrollY + toBounds.height * 0.5];
        // relative end point
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        // svg width & height
        const svgArea = [dx, dy];

        const svgEl = document.createElement("svg");
            svgEl.setAttribute("width", svgArea[0]);
            svgEl.setAttribute("height", svgArea[1]);
            svgEl.innerHTML = `<path d="M0 0" stroke="green" stroke-width="4" stroke-linecap="round" fill="transparent"></path>`;
        this.cubicBezier(svgEl.querySelector("path"), [0, 0, dx, dy], 1);
    }
    _cubicBezier(pathEl, points, curvature) 
    {
        const [x1, y1, x2, y2] = points;
        const hx1 = x1 + Math.abs(x2 - x1) * curvature;
        const hx2 = x2 - Math.abs(x2 - x1) * curvature;

        // cp = control point (these are like the handles)
        // C cp1X cp1Y, cp2X cp2Y, endX endY
        const curvePath = `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`;
        pathEl.setAttribute("d", curvePath);
    }
    registerNodeTypes()
    {

    }
    fromJSON()
    {

    }
    toJSON()
    {

    }
}