import fs from 'fs';
import chokidar from 'chokidar';
import upath from 'upath';
import isUncPath from 'is-unc-path';
import EventEmitter from "events";
import host from '../host';

const ImageSourceType = {
    OPENFILES: 0,
    DIRECTORY: 1,
    FILEWATCHER: 2
};

class ImageSourceValue 
{
    /**
     * Data object containing path (file or directory) and valid file extensions array for new image(s)
     * @param {string} path 
     * @param {string|Array} validExtensions 
     */
    constructor(path, validExtensions) 
    {
        this.path = path;
        this.extensions = typeof validExtensions === "string" ? validExtensions.split(",") : validExtensions;
    }
}

class ImageTap
{
    /**
     * Data object containing context information for processing new images
     * @param {string[]} consumers e.g. the receiving pipeline names
     * @param {ImageSourceType} sourceType e.g. ImageSourceType.FILEWATCHER
     * @param {ImageSourceValue} [sourceValue] e.g. { path: "C:/images" }
     */
    constructor(consumers, sourceType, sourceValue)
    {
        this.consumers = consumers;
        this.sourceType = sourceType;
        this.sourceValue = sourceValue;
    }
}

/**
 * Reads images from source described by ImageTap and produces file paths for consumption
 * A producer has a single source.
 * A producer will not automatically deplete when sourcing from a File Watcher
 */
export class ImageFileProducer extends EventEmitter
{
    constructor(imageTap) 
    {
        super();
        this._imageTap = imageTap;
        this._fileWatcher = null;
        this._isDepleted = false;
    }
    produce()
    {
        switch(this._imageTap.sourceType) 
        {
            case ImageSourceType.FILEWATCHERS: this._sourceFileWatchers(); break;
            case ImageSourceType.DIRECTORY: this._sourceDirectory(); break;
            case ImageSourceType.OPENFILES: this._sourceOpenFiles(); break;
            default: throw new Error("Unknown ImageSourceType: " + this._imageTap.sourceType);
        }
    }
    destroy()
    {
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
        const watchPaths = watchExtensions.map(ext => path.join(watchPathRoot, "*." + ext));

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
            this.emit("file", newPath);
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

        fs.readdir(directory, { encoding: "utf8" }, files => {
            files = files.map(file => upath.join(directory, file));
            files = files.filter(file => {
                const ext = file.split('.').pop();
                return extensions.includes(ext);
            });
            this.emit("files", files);
            this._isDepleted = true;
        });
    }
    /**
     * Asks Adobe application for currently open documents 
     */
    _sourceOpenFiles() 
    {
        host.runActionWithParameters("action.getOpenFilePaths")
        .then(files => {
            this.emit("files", files.split(','));
            this._isDepleted = true;
        });
    }
}
ImageFileProducer.withFileWatcher = function(consumers, directory, extensions) 
{
    return new ImageFileProducer(
        new ImageTap(consumers, ImageSourceType.FILEWATCHER, new ImageSourceValue(directory, extensions))
    );
};
ImageFileProducer.withDirectory = function(consumers, directory, extensions) 
{
    return new ImageFileProducer(
        new ImageTap(consumers, ImageSourceType.DIRECTORY, new ImageSourceValue(directory, validExtensions))
    );
};
ImageFileProducer.withOpenFiles = function(consumers) 
{
    return new ImageFileProducer(
        new ImageTap(consumers, ImageSourceType.OPENFILES, null)
    );
};