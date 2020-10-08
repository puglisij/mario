import Conf from 'conf';
import { EventEmitter } from 'events'

import _ from '../utils';

// TODO: Split General & Pipelines into their own Classes (and files)

const projectName = "Mario";
/**
 * General app configuration data 
 */
const general = new Conf({
    projectName,
    configName: "general",
    // See: http://json-schema.org/draft/2019-09/json-schema-validation.html
    schema: {
        checkIsScriptListenerActiveOnStart: {
            type: "boolean", 
            default: true
        },
        pauseAfterEveryPipeline: {
            type: "boolean",
            default: false
        },
        pauseAfterEveryAction: {
            type: "boolean",
            default: false
        },
        pauseAfterEveryImage: {
            type: "boolean",
            default: false
        },
        pauseOnExceptions: {
            type: "boolean",
            default: false
        },
        doReadFileMetadata: {
            type: "boolean", 
            default: false
        },
        logDirectory: { 
            type: "string",
            default: ""
        },
        runHttpServer: {
            type: "boolean",
            default: false
        },
        serverPort: {
            type: "number",
            default: 3001
        },
        pathToUserActions: {
            type: "string",
            default: ""
        }, 
        fileSources: {
            type: "array",
            default: [
                // TODO: Add Schema validation
                // {
                //  id: ""
                //  name: "",
                //  type: 0,
                //  path: "",
                //  useProcessedDirectory: true
                //  processedDirectory: "", 
                //  useOutputDirectory: true,
                //  outputDirectory: "",
                //  useErrorDirectory: true,
                //  errorDirectory: "",
                //  extensions: []
                // }
            ]
        },
        currentTab: {
            type: "string",
            default: "the-jsx-runner"
        },
        isMainDrawerOpen: {
            type: "boolean", 
            default: false
        }
    }
});
const generalDecorator = {

};

/**
 * Pipeline configurations 
 */
const pipelines = new Conf({
    projectName,
    configName: "pipelines",
    // See: http://json-schema.org/draft/2019-09/json-schema-validation.html
    schema: {
        pipelines: {
            type: "array",
            default: [
                // TODO: Add Schema validation
                // {
                //   id: "",
                //   name: "",
                //   sourceNames: [], 
                //   disabled: false,
                //   actions: []
                // }
            ]
        }
    }
});
const pipelinesDecorator = {
    getByNames(pipelineNames)
    {
        return this.pipelines.filter(p => pipelineNames.includes(p.name));
    },
    getByName(pipelineName) 
    {
        return this.pipelines.find(p => p.name === pipelineName);
    },
    getUniqueFileSourceNamesByPipelineNames(pipelineNames)
    {
        // Get all unique file sources for given pipelines
        let sourceNames = pipelineNames.reduce((arr, name) => {
            const pipeline = this.getByName(name);
            return arr.concat(pipeline.sourceNames);
        }, []);
        return _.unique(sourceNames);
    }
};


/**
 * Note that 'conf' does not monitor property changes on configuration object returned by .store property
 * Note Conf.store returns a new object each time
 * So we use our own Proxy here
 */
const ConfigurationProxy = (configurationInstance, configurationObject, events) => {
	const handler = {
        set(target, property, value) 
        {
            if(typeof target[property] !== typeof value) {
                throw new Error("Attempt to set configuration property " + property + " with different type. This should not happen.");
            } else {
                Reflect.set(target, property, value);
                configurationInstance.set(property, value);
                events.emit("change", property);
                console.log("Configuration updated. " + property + " -> " + value);
                return true;
            }
        },
        defineProperty(target, property, attributes) {
            if(!Reflect.has(target, property)) {
                throw new Error("Attempt to define new property " + property + " on configuration object. This should not happen.");
            }
        },
        deleteProperty() {
            throw new Error("Attempt to delete property "  + property + " from configuration object. This should not happen.");
        }
	};

	return new Proxy(configurationObject, handler);
};

/**
 * Root level configuration storage object
 * Configurations are split up as separate store properties
 */
const store = new EventEmitter();
/**
 * General configuration storage
 * NOTE: Only set root level properties or settings will be be saved to file
 * NOTE: Properties are set by Reference.
 */
store.general = ConfigurationProxy(general, Object.assign(general.store, generalDecorator), store);
/**
 * Pipeline configuration storage
 * NOTE: Only set root level properties or settings will be be saved to file
 * NOTE: Properties are set by Reference.
 */
store.pipelines = ConfigurationProxy(pipelines, Object.assign(pipelines.store, pipelinesDecorator), store);


export default store;