import upath from 'upath';

/**
 * Returns true if path starts with // or \\ 
 * @param {string} val the path string
 */
function isUncPath(val) 
{
    val = val.trim();
    return val.startsWith("//") || val.startsWith("\\\\");
}

/**
 * Same as upath.dirname except ensures that double slash is maintained for UNC paths
 * @param {string} val the path string
 */
function dirname(val)
{
    return _preserveUnc(val, upath.dirname(val));
}
/**
 * Same as upath.normalize except ensures that double slash is maintained for UNC paths
 * @param {string} val the path string
 */
function normalize(val)
{
    return _preserveUnc(val, upath.normalize(val));
}
/**
 * Same as upath.join except ensures that double slash is maintained for UNC paths
 * @param {string} val the path string
 */
function join(firstPart)
{
    return _preserveUnc.call(null, firstPart, upath.join.apply(upath, arguments));
}

function _preserveUnc(originalPath, newPath) 
{
    if(isUncPath(originalPath)) {
        return newPath.charAt(0) + newPath;
    } 
    return newPath;
}

export default {
    isUncPath,
    dirname,
    normalize, 
    join
}