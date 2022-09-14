export const EDebounceType = {
    Trailing: 0,
    Leading: 1,
    Both: 2
};

/**
 *  Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 * If `immediate` is EDebounceType.Trailing, trigger the function on the trailing edge, instead of the leading.
 * If `immediate` is EDebounceType.Both, trigger the function on both leading and trailing edges.
 */
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (immediate === EDebounceType.Trailing || immediate === EDebounceType.Both) 
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) { func.apply(context, args); }
    }
}

/** 
 * Returns a function which may only be called once every 'limit' milliseconds.
*/
function throttle (callback, limit, trailingEdge) {
    var wait = false;
    return function () {
        var context = this, args = arguments;
        if (!wait) {
            callback.apply(context, args);
            wait = true;
            setTimeout(function () {
                wait = false;
                if(trailingEdge) 
                    callback.apply(context, args);         
            }, limit);
        }
    }
}

/**
 * Basic object deep cloning using JSON parse & stringify
 * @param {object|array} obj 
 */
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

/**
 * Returns the date in format YYYYMMDD
 */
function yyyymmdd(date)
{
    function pad2(n) {  // always returns a string
        return (n < 10 ? '0' : '') + n;
    }
    date = date || new Date();
    return date.getFullYear() + 
            pad2(date.getMonth() + 1) + 
            pad2(date.getDate());
}

/**
* Returns the date in format YYYYMMDDhhmmss
*/
function yyyymmddhhmmssuu(date) 
{
    function pad(n, width) {  // always returns a string
        width = width || 2;
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
    date = date || new Date();
    return date.getFullYear() +
           pad(date.getMonth() + 1) + 
           pad(date.getDate()) +
           pad(date.getHours()) +
           pad(date.getMinutes()) +
           pad(date.getSeconds()) +
           pad(date.getMilliseconds(), 4);
}

function defaultForNativeType(value) 
{
    switch (typeof value) {
        case 'boolean'   : return false;
        case 'function'  : return function () {};
        case 'null'      : return null;
        case 'number'    : return 0;
        case 'object'    : return {};
        case 'string'    : return "";
        case 'symbol'    : return Symbol();
        case 'undefined' : return void 0;
        default: return null;
    }
}

function first(obj) 
{
    if(Array.isArray(obj)) {
        return obj[0];
    } 
    return obj[Object.keys(obj)[0]];
}
/**
 * Returns new array containing only unique values
 * Works for Numbers, Strings, and Boolean
 * @param {Array} arr 
 */
function unique(arr) {
    return [...new Set(arr)];
}
function getOrDefine(obj, key, defaultValue) 
{
    if(obj[key] === undefined) {
        obj[key] = defaultValue;
    }
    return obj[key];
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
    throttle,
    debounce,
    simpleDeepClone,
    guid, 
    yyyymmdd,
    yyyymmddhhmmssuu,
    defaultForNativeType,
    first,
    unique,
    getOrDefine,
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