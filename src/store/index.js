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
        pathToUserActions: {
            type: "string",
            default: ""
        },
        watchers: {
            type: "array",
            default: []
        },
        currentTab: {
            type: "string",
            default: "the-jsx-runner"
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
            default: []
        }
    }
});



/**
 * Object Proxy for monitorying configuration changes 
 */
const ConfigurationProxy = (confInstance, configurationObject, events) => {
	const handler = {
		get(target, property, receiver) {
			try {
                // Also Proxy nested properties
				return new Proxy(target[property], handler);
			} catch (err) {
				return Reflect.get(...arguments);
			}
        },
        set(target, property, value) 
        {
            if(typeof target[property] !== typeof value) {
                throw new Error("Attempt to set configuration with different type. This should not happen.");
            } else {
                Reflect.set(...arguments);
                confInstance.set(property, value);
                events.emit("change", property);
                return true;
            }
        },
        defineProperty(target, property, attributes) {
            if(!Reflect.has(target, property)) {
                throw new Error("Attempt to define new property on configuration object. This should not happen.");
            }
        },
        deleteProperty() {
            throw new Error("Attempt to delete properties from configuration object. This should not happen.");
        }
	};

	return new Proxy(configurationObject, handler);
};

/**
 * Note that 'conf' does not monitor property changes on configuration object returned by .store property
 * So we use our own Proxy here
 */
const store = new EventEmitter();
store.general = ConfigurationProxy(general, general.store, store);
store.pipelines = ConfigurationProxy(pipelines, pipelines.store, store);

export default store;