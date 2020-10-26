import fs from 'fs';
import EventEmitter from "events";

export const VALID_JSON_TYPES = [
    'string',
    'number',
    'object',
    'array',
    'boolean'
];

export default class Config extends EventEmitter
{
    constructor(opts) 
    {
        super();

        this._isLoaded = false;
        this._isLoading = false;
        this._isSaved = false;
        this._isSaving = false;
        this._isAnotherSavePending = false;
        this._lastSavedTime = 0;

        this._doAutoSave = opts.autoSave === true;
        this._schema = opts.schema;
        this._config = this._createDefaultConfigObject();
        this._configFilePath = opts.configFilePath;
    }
    _createDefaultConfigObject() 
    {
        let config = {};
        for (const [key, value] of Object.entries(this._schema)) 
        {
            if (!this._isValidJsonTypeName(value.type)) {
                throw new TypeError(`'type' ${value.type} for ${key} is not a valid JSON type name`);
            } 
            if(value.default && this._typeOf(value.default) !== value.type) {
                throw new TypeError(`'default' type ${this._typeOf(value.default)} does not match specified 'type'`);
            }
            config[key] = value.default || this._defaultForTypeName(value.type);
        }
        return config;
    }
    _validateConfig() 
    {
        for (const [key, value] of Object.entries(this._config)) 
        {
            if(!this._schema[key]) {
                throw new Error(`Property ${key} not found in schema`);
            }
            if(this._typeOf(value) !== this._schema[key].type) {
                throw new TypeError(`${this._typeOf(value)} does not match schema type ${this._schema[key].type}`)
            }
        }
    }
    _isValidJsonTypeName(type) {
        return VALID_JSON_TYPES.includes(type);
    }
    _defaultForTypeName(type) {
        switch(type) {
            case 'string': return "";
            case 'number': return 0;
            case 'object': return {};
            case 'array': return [];
            case 'boolean': return false;
        }
        return null;
    }
    _typeOf(value) {
        if(Array.isArray(value)) {
            return "array";
        } 
        return typeof value;
    }

    load() 
    {
        if(this._isLoaded || this._isLoading)
            return;

        this._isLoading = true;
        fs.readFile(this._configFilePath, (err, data) => {
            this._isLoading = false;
            // ENOENT = file missing
            if(err && err.code !== 'ENOENT') throw err;
            if(!err) {
                // Assume file exists and data read successfully
                this._config = JSON.parse(data);
                this._validateConfig();
            }
            this._isSaved = true;
            this._isLoaded = true;
            this.emit("loaded");
        });
    }
    save() 
    {
        if(this._isSaved) 
            return;
        if(this._isSaving) {
            this._isAnotherSavePending = true;
            return;
        }

        this._isSaving = true;
        fs.writeFile(this._configFilePath, JSON.stringify(this._config, null, 2), err => {
            this._isSaving = false;
            if(err) throw err;

            this._isLoaded = true;
            this._isSaved = true;
            this._lastSavedTime = Date.now();
            this.emit("saved", this._lastSavedTime);

            if(this._isAnotherSavePending) {
                this._isAnotherSavePending = false;
                process.nextTick(() => this.save);
            }
        });
    }
    getLastSavedTime() {
        return this._lastSavedTime;
    }
    get(key) 
    {
		return key.split('.').reduce((accumulator, property) => accumulator[property], this._config);
    }
    set(key, value) 
    {
        this._isSaved = false;

        const tokens = key.split('.');
        const lastToken = tokens.pop();
        const parent = tokens.reduce((accumulator, property) => accumulator[property], this._config);
        const property = parent[lastToken];
        if(this._typeOf(property) !== this._typeOf(value)) {
            throw new TypeError(`Property ${key} type ${this._typeOf(property)} does not match value type ${this._typeOf(value)}`);
        }
        // Set value
        parent[lastToken] = value;

        if(this._doAutoSave) {
            this.save();
        }
    }
}