"use strict";


function Enum(enumArr, offset) 
{
    if(!(this instanceof Enum)) { return new Enum(enumArr, offset); }

    return create_.call(this, enumArr, offset);
}
/** Essentially the enumeration starting value. Default is 0 */
Enum.prototype.offset = 0;
/** Return a copy of this.keys */
Enum.prototype.toArray = function() {
    return this.keys.slice(0);
};
/** Returns whether the given value is in the enumeration */
Enum.prototype.isValid = function(val) {
    return Number.isInteger(val) && (val - this.offset) < this.keys.length && (val - this.offset) >= 0;
};
/** Returns the key associated with the given value, else undefined. */
Enum.prototype.toKey = function(val) {
    if( !this.isValid(val) ) { return undefined; }
    return this.keys[val - this.offset];
};
/** Returns the value associated with the given key, else undefined. */
Enum.prototype.parse = function(key) {
    if( !(typeof key === "string") ) { return undefined; }

    key = key.trim().toUpperCase();
    for(var i = 0; i < this.keys.length; ++i) {
        if( this.keys[i].toUpperCase() === key ) { 
            return i + this.offset; 
        }
    }
    return undefined;
};

/**
 * TODO: Needs Performance Improvement
 * @param {*} enumArr 
 * @param {*} offset 
 */
function create_(enumArr, offset) 
{
    if(!Array.isArray(enumArr)) {
        throw new Error("Enum: create() Invalid parameter type. Expected Array.");
    }

    var validName = /[A-Z_][A-Z0-9_]*/gi;

    // Define array keys as properties
    var enumer = this;
        enumer.keys = [];
        enumer.keys.length = enumArr.length;

    if(Number.isInteger(offset)) {
        enumer.offset = offset;
    } else {
        offset = 0;
    }
        
    var nextKey;
    for(var i = 0; i < enumArr.length; ++i) {
        if( typeof enumArr[i] !== "string" || !validName.test(enumArr[i]) ) {
            throw new Error("Enum: create() Not a string or Invalid name: " + enumArr[i]);
        }
        validName.lastIndex = 0;
        
        nextKey = enumArr[i];
        enumer.keys[i] = nextKey;
        enumer[ nextKey ] = i + offset;       
    }

    // TODO: After dropping IE8 support, use defineProperty
    // Object.defineProperty(this, 'enumValues', {
    //     value: [],
    //     configurable: false,
    //     writable: false,
    //     enumerable: true
    // });
    return enumer;
}

export default Enum;
