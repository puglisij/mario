if (!Object.keys) 
{
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}


// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) 
{
  Array.prototype.findIndex = function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;

      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        k++;
      }

      return -1;
    };
}

if (!Array.prototype.includes) 
{
  Array.prototype.includes = function (searchElement, fromIndex) 
  {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (len === 0) {
        return false;
      }

      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      return false;
    };
}

if (!Array.prototype.filter) 
{
    Array.prototype.filter = function(func, thisArg) {
        'use strict';
        if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
            throw new TypeError();
    
        var len = this.length >>> 0,
            res = new Array(len), // preallocate array
            t = this, c = 0, i = -1;

        var kValue;
        if (thisArg === undefined) {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    kValue = t[i]; // in case t is changed in callback
                    if (func(t[i], i, t)) {
                        res[c++] = kValue;
                    }
                }
            }
        }
        else {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    kValue = t[i];
                    if (func.call(thisArg, t[i], i, t)) {
                        res[c++] = kValue;
                    }
                }
            }
        }
    
        res.length = c; // shrink down array to proper size
        return res;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach (callback, thisArg) {
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      var array = this;
      thisArg = thisArg || this;
      for (var i = 0, l = array.length; i !== l; ++i) {
        callback.call(thisArg, array[i], i, array);
      }
    };
}
if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

if (!String.prototype.startsWith) 
{
    String.prototype.startsWith = function(search, rawPos) {
        var pos = rawPos > 0 ? rawPos|0 : 0;
        return this.substring(pos, pos + search.length) === search;
    };
}

if (!String.prototype.endsWith) 
{
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

if (!String.prototype.trim) 
{
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

if (typeof Object.assign !== 'function') {
   // Modified from MDN to remove dependency on Object.defineProperty
   Object.assign = function assign(target, varArgs) { 
        'use strict';
        if (target === null || target === undefined) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource !== null && nextSource !== undefined) { 
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    }
}

/**
* Polyfil setTimeout (via host <-> client event magic)
* ExtendScript doesn't have a native setTimeout.
* NOTE: delay will be somewhat imprecise. 
*/
var setTimeoutCallbacks = [];
var setTimeoutId = 0;
this.setTimeout = function(cb, delay) {
    var id = setTimeoutId++;
    setTimeoutCallbacks[id] = cb;
    JsxEvents.dispatch("setTimeout", id + "," + delay);
};
this.executeSetTimeoutCallback = function(id) {
    if(setTimeoutCallbacks[id]) {
        setTimeoutCallbacks[id]();
        delete setTimeoutCallbacks[id];
    }
};

"";