import fs from 'fs';
import Config, { VALID_JSON_TYPES } from '../src/store/config';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

describe('Config', function()
{
    const SCHEMA_ERROR_BAD_TYPE = {
        dummy: {
            type: "nope"
        }
    };
    const SCHEMA_ERROR_MISSING_TYPE = {
        missing: {}
    };
    const SCHEMA_OK_MISSING_DEFAULT = {
        good: {
            type: "boolean"
        }
    };
    const SCHEMA_OK_WITH_DEFAULT = {
        myArray: {
            type: "array", 
            default: [1,2,3]
        }
    };
    const SCHEMA_OK_ALL_TYPES = {};
    const CONFIG_PATH = "./test/config.json";

    before(function() 
    {
        VALID_JSON_TYPES.forEach(type => {
            SCHEMA_OK_ALL_TYPES[type] = {
                type
            };
        });
    });

    it('throws if invalid schema type', function()
    {
        (function () {
            new Config({
                schema: SCHEMA_ERROR_BAD_TYPE
            });
        }.should.throw());
    });

    it('throws if missing schema type', function() {
        (function () {
            new Config({
                schema: SCHEMA_ERROR_MISSING_TYPE
            });
        }.should.throw());
    });

    it('constructs with missing schema default', function() {
        const config = new Config({
            schema: SCHEMA_OK_MISSING_DEFAULT
        });
        expect(config.get("good")).to.equal(false);
    });

    it('constructs and uses schema default', function() {
        const config = new Config({
            schema: SCHEMA_OK_WITH_DEFAULT
        });
        expect(config.get("myArray")).to.have.members(SCHEMA_OK_WITH_DEFAULT.myArray.default);
    });

    it('constructs with every type', function() {
        const config = new Config({
            schema: SCHEMA_OK_ALL_TYPES
        });
        expect(config._config).to.have.all.keys(VALID_JSON_TYPES);
    });

    const SCHEMA = {
        saveMe: {
            type: "number",
            default: 2
        },
        shallow: {
            type: "string",
            default: "water"
        },
        deep :{
            type: "object",
            default: {
                well: "water"
            }
        }
    };

    it('autosave works', function(done) 
    {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            autoSave: true,
            schema: SCHEMA
        });
        expect(config.get("saveMe")).to.equal(2);
        
        config.on("saved", async () => {
            // Read file 
            fs.readFile(CONFIG_PATH, (err, data) => {
                if(err) throw err;
                const json = JSON.parse(data);
                expect(json.saveMe).to.equal(1);
                done();
            });
        });
        config.set("saveMe", 1);
    });

    it('should load only once', function(done) {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            schema: SCHEMA
        });
        config.on("loaded", done);
        config.load();
        config.load();
        config.load();
    });

    it('should save only once with rapid consecutive save() calls', function(done) {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            schema: SCHEMA
        });
        config.on("saved", () => done());
        config.save();
        config.save();
        config.save();
    });

    it('gets properties using dot notation', function(done) {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            schema: SCHEMA
        });
        config.on("loaded", () => {
            const deep = config.get("deep.well");
            expect(deep).to.equal(SCHEMA.deep.default.well);
            const shallow = config.get("shallow");
            expect(shallow).to.equal(SCHEMA.shallow.default);
            done();
        });
        config.load();
    });

    it('gets proper value after set', function() {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            schema: SCHEMA
        });
        config.set("deep.well", "oil");
        const newValue = config.get("deep.well");
        expect(newValue).to.equal("oil");
    });

    it('throws if set type differs from schema', function() {
        const config = new Config({
            configFilePath: CONFIG_PATH,
            schema: SCHEMA
        });
        (function() {
            config.set("shallow", []);
        }.should.throw());
    });
});