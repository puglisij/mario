import Conf from 'conf';
import { EventEmitter } from 'events'

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
        pathToUserActions: {
            type: "string",
            default: ""
        }, 
        fileWatchers: {
            type: "array",
            default: [
                // TODO: Add Schema validation
                // {
                //  id: ""
                //  name: "",
                //  path: "",
                //  useProcessedPath: true
                //  processedPath: "", 
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
        },
        // See ImageSourceType enum
        imageSource: {
            type: "object", 
            default: {
                type: "ACTIVEDOCUMENT", 
                directory: "", 
                extensions: []
            }
        }
    }
});

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
                //   watcherNames: [], 
                //   disabled: false,
                //   actions: []
                // }
            ]
        }
    }
});



/**
 * Note that 'conf' does not monitor property changes on configuration object returned by .store property
 * Note Conf.store returns a new object each time
 * So we use our own Proxy here
 */
const ConfigurationProxy = (configurationInstance, configurationObject, events) => {
	const handler = {
		// get(target, property, receiver) {
		// 	try {
        //         // Also Proxy nested properties
		// 		return new Proxy(target[property], handler);
		// 	} catch {
        //         return Reflect.get(target, property);
		// 	}
        // },
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
 */
store.general = ConfigurationProxy(general, general.store, store);
/**
 * Pipeline configuration storage
 * NOTE: Only set root level properties or settings will be be saved to file
 */
store.pipelines = ConfigurationProxy(pipelines, pipelines.store, store);


export default store;