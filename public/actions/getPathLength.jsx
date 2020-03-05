
/**
* Calculate the total length of the path along all segments as given by path points
* @param {SubPathItem} subPathItem
* @returns total length (in current document ruler units)
*/
action.getPathLength = function getPathLength(subPathItem)
{
    function distance(anchor1, anchor2) 
    {
        var dx = anchor2[0] - anchor1[0];
        var dy = anchor2[1] = anchor2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    var points = subPathItem.pathPoints;
    var total = 0;
    for(var i = 1; i < points.length; ++i) {
        total += distance(points[i - 1].anchor, points[i].anchor);
    }
    return total;
}