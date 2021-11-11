import upath from 'upath';

/*
    This library provides pathing functions which preserve the posix style forward slash / in the paths 
    whilst preserving UNC pathing (which starts with \\ on windows)
*/

/**
 * Returns true if path starts with // or \\ 
 * @param {string} val the path string
 */
function isUncPath(val) 
{
    val = val.trim();
    return val.startsWith("//") || val.startsWith("\\\\");
}

function _preserveUnc(originalPath, newPath) 
{
    if(isUncPath(originalPath)) {
        return newPath.charAt(0) + newPath;
    } 
    return newPath;
}

/**
 * Normalizes and compares the two paths to determine 
 * if the given child is a child path of the given ancestor
 * @param {string} descendant 
 * @param {string} ancestor 
 */
function isAncestor(ancestor, descendant)
{
    const relative = upath.relative(ancestor, descendant);
    // If not ancestor, beginning of path will contain directory traversal (e.g. ../../)
    return descendant.endsWith(relative);
}
/**
 * Same as upath.basename 
 * @param {string} val the path string
 */
 function basename(val)
 {
     return upath.basename(val);
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
/**
 * Returns the file/directory basename of the 'from' path renamed with the parent directory of 'to' path
 * Example: ('C:/foo/bar', 'E:/target') -> 'E:/target/bar'
 * @param {string} from the source file/directory
 * @param {string} to the destination file/directory
 * @param {boolean} [isToADirectory = false] pass true if 'to' is a directory. Otherwise dirname(to) will be used when joining paths
 */
function remap(from, to, isToADirectory) {
    const toName = upath.basename(from);
    const toParentDir = isToADirectory ? to : upath.dirname(to);
    return _preserveUnc(to, upath.join(toParentDir, toName));
}

export default {
    isAncestor,
    isUncPath,
    basename,
    dirname,
    normalize, 
    join, 
    remap
}