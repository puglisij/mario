import fs from 'fs';
import chokidar from 'chokidar';
import upath from 'upath';
import isUncPath from 'is-unc-path';
import EventEmitter from "events";
import ImageSourceType from './imageSourceType';
import host from '../host';


class ImageSourceValue 
{
    /**
     * Data object containing path (file or directory) and valid file extensions array for new image(s)
     * @param {string} path 
     * @param {string[]} validExtensions 
     */
    constructor(path, validExtensions) 
    {
        this.path = path;
        this.extensions = validExtensions;
    }
}

class ImageTap
{
    /**
     * Data object containing context information for processing new images
     * @param {ImageSourceType} sourceType e.g. ImageSourceType.FILEWATCHER
     * @param {ImageSourceValue} [sourceValue] e.g. { path: "C:/images" }
     */
    constructor(sourceType, sourceValue)
    {
        this.sourceType = sourceType;
        this.sourceValue = sourceValue;
    }
}


let nextProducerId = 0;
/**
 * Reads images from source described by ImageTap and produces file paths for consumption
 * A producer has a single source.
 * A producer will not automatically deplete when sourcing from a File Watcher
 * IMPORTANT: Multiple producers should not be created for the same set of files
 */
export default class ImageFileProducer extends EventEmitter
{
    constructor(imageTap) 
    {
        super();
        this._id = nextProducerId++;
        this._imageTap = imageTap;
        this._fileWatcher = null;
        this._isDepleted = false;
    }
    get id() {
        return this._id;
    }
    produce()
    {
        switch(this._imageTap.sourceType) 
        {
            case ImageSourceType.FILEWATCHER: this._sourceFileWatchers(); break;
            case ImageSourceType.DIRECTORY: this._sourceDirectory(); break;
            case ImageSourceType.OPENFILES: this._sourceOpenFiles(); break;
            case ImageSourceType.BLANK: this._sourceBlank(); break;
            default: throw new Error("Unknown ImageSourceType: " + this._imageTap.sourceType);
        }
    }
    destroy()
    {
        // ASSERT: Should NOT emit any more files from this point
        if(this._fileWatcher) {
            this._fileWatcher.removeAllListeners();
            this._fileWatcher.close();
        }
        this.removeAllListeners();
    }
    _sourceFileWatchers() 
    {
        const watchPathRoot = this._imageTap.sourceValue.path;
        const watchExtensions = this._imageTap.sourceValue.extensions;
        const watchPaths = watchExtensions.map(ext => upath.join(watchPathRoot, "*." + ext));

        if(isUncPath(watchPathRoot)) {
            throw Error(`Watching network paths is problematic. Only local directories supported at this time.`);
        }
        if(!fs.existsSync(watchPathRoot)) {
            throw Error(`Watch path: ${watchPathRoot} does not exist.`);
        }
        const watcher = chokidar.watch(watchPaths, {
            ignored: /^\./, 
            depth: 0,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 500
            }
        })
        .on("add", newPath => 
        {
            this.emit("files", this._id, [newPath]);
        });

        this._fileWatcher = watcher;
    }
    /**
     * Reads source directory for files and filters by extensions
     */
    _sourceDirectory() 
    {
        const directory = this._imageTap.sourceValue.path;
        const extensions = this._imageTap.sourceValue.extensions;

        fs.readdir(directory, { encoding: "utf8" }, (error, files) => {
            if(error) {
                this.emit("depleted", this._id);
                throw new Error(error);
            }
            if(files) 
            {
                files = files.map(file => upath.join(directory, file));
                files = files.filter(file => {
                    const ext = file.split('.').pop();
                    return extensions.includes(ext);
                });
                this._isDepleted = true;
                this.emit("files", this._id, files);
            }
            this.emit("depleted", this._id);
        });
    }
    /**
     * Asks Adobe application for currently open documents 
     */
    _sourceOpenFiles() 
    {
        host.runActionWithParameters("action.getOpenFilePaths")
        .then(files => {
            this._isDepleted = true;
            this.emit("files", this._id, files.split(','));
            this.emit("depleted", this._id);
        });
    }
    _sourceBlank()
    {
        this._isDepleted = true;
        this.emit("files", this._id, [""]);
        this.emit("depleted", this._id);
    }
}
/**
 * Create an ImageFileProducer instance with a file watcher as its source
 * @param {string} directory directory which will be watched for new files
 * @param {string[]} extensions an array of valid extensions to read (e.g. "psd", "jpg", etc)
 */
ImageFileProducer.withFileWatcher = function(directory, extensions) 
{
    return new ImageFileProducer(
        new ImageTap(ImageSourceType.FILEWATCHER, new ImageSourceValue(directory, extensions))
    );
};
/**
 * Create an ImageFileProducer instance with a directory as its source
 * @param {string} directory directory which will be watched for new files
 * @param {string[]} extensions an array of valid extensions to read (e.g. "psd", "jpg", etc)
 */
ImageFileProducer.withDirectory = function(directory, extensions) 
{
    return new ImageFileProducer(
        new ImageTap(ImageSourceType.DIRECTORY, new ImageSourceValue(directory, extensions))
    );
};
/**
 * Create an ImageFileProducer instance with files open in Adobe as the source
 */
ImageFileProducer.withOpenFiles = function() 
{
    return new ImageFileProducer(
        new ImageTap(ImageSourceType.OPENFILES, null)
    );
};
/**
 * Create an ImageFileProducer which emits a single empty string for a file path
 */
ImageFileProducer.withBlank = function() 
{
    return new ImageFileProducer( 
        new ImageTap(ImageSourceType.BLANK, null)
    );
};