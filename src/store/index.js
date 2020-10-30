import upath from 'upath';

import ImageSource from '../server/imageSource';
import ArrayMap from '../arrayMap';
import Config from '../store/config';
import appGlobal from '../global';
import _ from '../utils';

// TODO: Split General & Pipelines into their own Classes (and files)

/**
 * General app configuration data 
 */
class GeneralConfig extends Config
{
    constructor() {
        super({
            filePath: upath.join(appGlobal.appDefaultConfigPath, "general.json"),
            doExtend: true,
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
    }
    /**
     * Returns the ImageSource by the given name
     * @param {string} name 
     * @returns {ImageSource}
     */
    getImageSourceByName(name) 
    {
        const source = this._data.fileSources.find(s => s.name === name);
        if(source) {
            return ImageSource.fromObject(source);
        }
        return null;
    }
}

/**
 * Pipeline configurations 
 */
class PipelinesConfig extends Config
{
    constructor() 
    {
        super({
            filePath: upath.join(appGlobal.appDefaultConfigPath, "pipelines.json"),
            doExtend: true,
            schema: {
                pipelines: {
                    type: "array",
                    default: []
                }
            }
        });
    }
    getByNames(pipelineNames, includeDisabled)
    {
        return this._data.pipelines.filter(p => {
            return pipelineNames.includes(p.name) && (includeDisabled || !p.disabled);
        });
    }
    getByName(pipelineName, includeDisabled) 
    {
        return this._data.pipelines.find(p => {
            return p.name === pipelineName && (includeDisabled || !p.disabled); 
        });
    }
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
}

class Store 
{
    constructor() 
    {
        /**
         * General configuration storage
         * NOTE: Properties are set by Reference.
         */
        this.general = new GeneralConfig();
        this.general.on("loaded", () => {
            console.log("Configuration 'general' loaded.");
        });
        this.general.on("saved", () => {
            console.log("Configuration 'general' saved.");
        });
        /**
         * Pipeline configuration storage
         * NOTE: Properties are set by Reference.
         */
        this.pipelines = new PipelinesConfig();
        this.pipelines.on("loaded", () => {
            console.log("Configuration 'pipelines' loaded.");
        });
        this.pipelines.on("saved", () => {
            console.log("Configuration 'pipelines' saved.");
        });
    }
    async init() 
    {
        console.log("Configurations loading started.");

        await this.general.load();
        await this.pipelines.load();

        console.log("Configurations loaded.");
    }
}


export default new Store();