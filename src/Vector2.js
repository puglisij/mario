function Vector2(x, y) 
{
    if (!(this instanceof Vector2)) {
        return new Vector2(x, y);
    }
    this.x = x || 0;
    this.y = y || 0;
};
Vector2.prototype = 
{
    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    },
    sub: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    },
    mul: function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },
    div: function(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },
    /** Component-wise scale by the given vector */
    scale: function(vec) {
        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    },
    /** @returns vector length, or magnitude */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    /** Normalize to unit vector */
    norm: function() {
        this.div( this.mag() );
        return this;
    },
    /** @returns distance to given vector */
    dist: function(vec) {
        return new Vector2(vec.x, vec.y).sub(this).mag();
    },
    equals: function(vec) {
        return vec.x === this.x && vec.y === this.y;
    },
    copy: function() {
        return new Vector2(this.x, this.y);
    },
    toString: function() {
        return [this.x, this.y].join(',');
    }
};
// Static functions 
Vector2.Lerp = function(a, b, t) 
{
    t = t > 1 ? 1 : t < 0 ? 0 : t;
    return new Vector2(
        a.x + (b.x - a.x) * t,
        a.y + (b.y - a.y) * t
    );
};
Vector2.fromSize = function(el) {
    return new Vector2(el.clientWidth, el.clientHeight);
};
Vector2.fromOffset = function(el) {
    var bounds = el.getBoundingClientRect();
    return new Vector2(
        bounds.left + window.pageXOffset - document.documentElement.clientLeft,
        bounds.top + window.pageYOffset - document.documentElement.clientTop
    );
};

export default Vector2;