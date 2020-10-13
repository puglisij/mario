import Conf from 'conf';
import { EventEmitter } from 'events'
import ImageSource from '../server/imageSource';
import ArrayMap from '../arrayMap';

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
        logDirectory: { 
            type: "string",
            default: ""
        },
        logFilePersistForDays: {
            type: "number", 
            default: 3
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
                // Objects matching ImageSource
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
    /**
     * Returns the ImageSource by the given name
     * @param {string} name 
     * @returns {ImageSource}
     */
    getImageSourceByName(name) 
    {
        const source = this.fileSources.find(s => s.name === name);
        if(source) {
            return ImageSource.fromObject(source);
        }
        return null;
    }
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
    getByNames(pipelineNames, includeDisabled)
    {
        return this.pipelines.filter(p => {
            return pipelineNames.includes(p.name) && (includeDisabled || !p.disabled);
        });
    },
    getByName(pipelineName, includeDisabled) 
    {
        return this.pipelines.find(p => {
            return p.name === pipelineName && (includeDisabled || !p.disabled); 
        });
    },
    /**
     * Returns unique mapping of image source name -> pipeline name
     * @param {Array<string>} pipelineNames
     * @param {boolean} [includeDisabled = false]
     * @returns {ArrayMap<string, string>}
     */
    getImageSourceNameToPipelineNameMap(pipelineNames, includeDisabled) 
    {
        // Collect all unique file sources for given pipelines
        let fileSourceNameToPipelineNames = new ArrayMap();
        pipelineNames.forEach(pipelineName =>
        {
            const pipeline = this.getByName(pipelineName);
            if(!pipeline) {
                return;
            }
            for(let fileSourceName of pipeline.sourceNames) {
                fileSourceNameToPipelineNames.set(fileSourceName, pipeline.name);
            }
        });
        return fileSourceNameToPipelineNames;
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