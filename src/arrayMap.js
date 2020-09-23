
export default class ArrayMap 
{
    constructor() {
        this.map = new Map();
        ["get", "has", "delete", "keys", "values"].forEach(key => {
            this[key] = this.map[key].bind(this.map);
        });
    }
    set(key, value) {
        let array = this.map.get(key);
        if(Array.isArray(array)) {
            array.push(value);
        } else {
            this.map.set(key, [value]);
        }
    }
}