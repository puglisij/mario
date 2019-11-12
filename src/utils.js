
function simpleDeepClone(obj)
{
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Generates a GUID string. Not a standard-compliant GUID.
 * @returns {string} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser.
 * @link http://slavik.meltser.info/?p=142
 */
function guid() 
{
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function first(obj) 
{
    if(Array.isArray(obj)) {
        return obj[0];
    } 
    return obj[Object.keys(obj)[0]];
}
function isBoolean(val) {
    return typeof val === "boolean";
}
function isNumber(val) {
    return typeof val === "number" && val === val;
}
function isObject(val) {
    return val !== null && typeof(val) === "object";
}
function isEmptyObject(obj) 
{
    return Object.keys(obj || {}).length === 0;
}
function isString(val) {
    return typeof val === "string";
}
function isEmptyString(val) {
    return val === "";
}
function isArray(val) 
{
    return Array.isArray(val)
}
function isUndefined(val) {
    return typeof val === "undefined";
}
function isNull(val) {
    return val === null;
}


export default {
    simpleDeepClone,
    guid, 
    first,
    isBoolean, 
    isNumber,
    isObject,
    isEmptyObject,
    isString,
    isEmptyString,
    isArray,
    isUndefined, 
    isNull
}