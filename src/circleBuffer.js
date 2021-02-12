

export default class CircleBuffer
{
    constructor(size)
    {
        if(size <= 0) {
            throw new Error("Size must be greater than 0.");
        }
        this._array = new Array(size);
        this._size = size;
        this._pointer = 0;
    }

    push(val)
    {
        this._array[this._pointer] = val;
        this._pointer = (this._pointer + 1) % this._size;
    }
    clear() {
        this._array = new Array(this._size);
        this._pointer = 0;
    }
    /**
     * Returns underlying array in order. This is NOT a clone.
     */
    toArray()
    {
        return [
            ...this._array.slice(this._pointer),
            ...this._array.slice(0, this._pointer)
        ];
    }
}