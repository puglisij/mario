import fs from 'fs';
import chokidar from 'chokidar';
import upath from 'upath';
import isUncPath from 'is-unc-path';
import EventEmitter from "events";
import ImageSource from './imageSource';
import ImageSourceType from './imageSourceType';
import host from '../host';
import _, { EDebounceType } from '../utils';


let nextProducerId = 0;
/**
 * Reads images from source described by ImageSource and produces file paths for consumption
 * A producer has a single source.
 * A producer will not automatically deplete when sourcing from a File Watcher
 * IMPORTANT: Multiple producers should not be created for the same set of files
 */
export default class ImageFileProducer extends EventEmitter
{
    constructor(imageSource) 
    {
        super();
        this._id = nextProducerId++;
        this._imageSource = imageSource;
        this._fileWatcher = null;
        this._isDepleted = false;

        // NOTE: We debounce in order to collect files from file watcher and emit them 
        // in one lump. This helps avoid issues where shared files are moved at the end
        // of an IMAGE process pre-maturely, when the next process also needs them.
        // This isn't the best solution, since it is a completely blind process.
        // A better option would be to submit explicit files for processing as one 'job',
        // via a REST api or similar interface.
        this._q = [];
        this._emitQFiles = _.debounce(this._emitQFiles, 5000, EDebounceType.Trailing);
    }
    get id() {
        return this._id;
    }
    produce()
    {
        // TODO: Split source types into their own implementation of a producer interface?
        switch(this._imageSource.sourceType) 
        {
            case ImageSourceType.FILEWATCHER: this._sourceFileWatchers(); break;
            case ImageSourceType.DIRECTORY: this._sourceDirectory(); break;
            case ImageSourceType.OPENFILES: this._sourceOpenFiles(); break;
            case ImageSourceType.BLANK: this._sourceBlank(); break;
            case ImageSourceType.ACTIVEDOCUMENT: this._sourceActiveDocument(); break;
            default: throw new Error("Unknown ImageSourceType: " + this._imageSource.sourceType);
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
    getImageSource()
    {
        return this._imageSource;
    }
    toString() {
        return `\tid = ${this._id}\n\timageSource = (${this._imageSource.toString()})`;
    }
    _emitFiles(files) 
    {
        if(files.length <= 0) {
            return;
        }
        this.emit("files", this._id, files);
    }
    _emitQFiles()
    {
        const files = this._q;
        this._q = [];
        this._emitFiles(files);
    }
    _sourceFileWatchers() 
    {
        const watchPathRoot = this._imageSource.sourceDirectory;
        const watchExtensions = this._imageSource.sourceExtensions;
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
            usePolling: true,
            interval: 5000,
            awaitWriteFinish: {
                stabilityThreshold: 5000,
                pollInterval: 5000
            }
        })
        .on("add", newPath => 
        {
            if(upath.basename(newPath).startsWith("manifest")) {
                return;
            }
            this._q.push(newPath);
            this._emitQFiles();
        });

        this._fileWatcher = watcher;
    }
    /**
     * Reads source directory for files and filters by extensions
     */
    _sourceDirectory() 
    {
        const directory = this._imageSource.sourceDirectory;
        const extensions = this._imageSource.sourceExtensions;

        fs.readdir(directory, { encoding: "utf8" }, (error, files) => {
            if(error) {
                this.emit("depleted", this._id);
                throw new Error(error);
            }
            if(files) 
            {
                files = files.map(file => upath.join(directory, file));
                files = files.filter(file => {
                    if(upath.basename(file).startsWith("manifest")) {
                        return false;
                    }
                    const ext = file.split('.').pop();
                    return extensions.includes(ext);
                });
                this._isDepleted = true;
                this._emitFiles(files);
            }
            this.emit("depleted", this._id);
        });
    }
    /**
     * Asks Adobe application for currently open documents 
     */
    _sourceOpenFiles() 
    {
        host.runActionWithParameters("action.getOpenDocumentPaths")
        .then(filePaths => {
            this._isDepleted = true;
            this._emitFiles(filePaths.split(','));
            this.emit("depleted", this._id);
        });
    }
    _sourceBlank()
    {
        this._isDepleted = true;
        this._emitFiles([""]);
        this.emit("depleted", this._id);
    }
    _sourceActiveDocument()
    {
        host.runActionWithParameters("action.getActiveDocumentPath")
        .then(filePath => {
            this._isDepleted = true;
            this._emitFiles(filePath ? [filePath] : []);
            this.emit("depleted", this._id);
        });
    }
}