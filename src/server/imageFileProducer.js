import fs from 'fs';
import chokidar from 'chokidar';
import upath from 'upath';
import isUncPath from 'is-unc-path';
import EventEmitter from "events";
import ImageSourceType from './imageSourceType';
import host from '../host';


class ImageSourcePath 
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

class ImageSource
{
    /**
     * Data object containing context information for processing new images
     * @param {ImageSourceType} sourceType e.g. ImageSourceType.FILEWATCHER
     * @param {ImageSourcePath} [sourcePath] e.g. { path: "C:/images" }
     * @param {string} [outputDirectory]
     * @param {string} [processedDirectory]
     */
    constructor(sourceType, sourcePath, outputDirectory, processedDirectory)
    {
        this.sourceType = sourceType;
        this.sourcePath = sourcePath;
        this.outputDirectory = outputDirectory;
        this.processedDirectory = processedDirectory;
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
    constructor(imageSource) 
    {
        super();
        this._id = nextProducerId++;
        this._imageSource = imageSource;
        this._fileWatcher = null;
        this._isDepleted = false;
    }
    get id() {
        return this._id;
    }
    produce()
    {
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
    _emitFiles(files) 
    {
        // TODO: Emit ImageSource here? Is 'id' enough?
        this.emit("files", this._id, files);
    }
    _sourceFileWatchers() 
    {
        const watchPathRoot = this._imageSource.sourcePath.path;
        const watchExtensions = this._imageSource.sourcePath.extensions;
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
            awaitWriteFinish: {
                stabilityThreshold: 5000,
                pollInterval: 5000
            }
        })
        .on("add", newPath => 
        {
            this._emitFiles([newPath]);
        });

        this._fileWatcher = watcher;
    }
    /**
     * Reads source directory for files and filters by extensions
     */
    _sourceDirectory() 
    {
        const directory = this._imageSource.sourcePath.path;
        const extensions = this._imageSource.sourcePath.extensions;

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
/**
 * Create an ImageFileProducer instance with a file watcher as its source
 * @param {string} directory directory which will be watched for new files
 * @param {string[]} extensions an array of valid extensions to read (e.g. "psd", "jpg", etc)
 * @param {string} outputDirectory directory where pipeline outputs will be written
 * @param {string} processedDirectory directory where source files will be moved to when finished processing
 */
ImageFileProducer.withFileWatcher = function(directory, extensions, outputDirectory, processedDirectory) 
{
    return new ImageFileProducer(
        new ImageSource(ImageSourceType.FILEWATCHER, new ImageSourcePath(directory, extensions), outputDirectory, processedDirectory)
    );
};
/**
 * Create an ImageFileProducer instance with a directory as its source
 * @param {string} directory directory which will be watched for new files
 * @param {string[]} extensions an array of valid extensions to read (e.g. "psd", "jpg", etc)
 */
ImageFileProducer.withDirectory = function(directory, extensions) 
{
    // TODO: Add outputDirectory, and processedDirectory options here
    // TODO: Allow use of Directory AS the Source, instead of reading its files. Which means the Producer can produce directory paths, instead of just files
    return new ImageFileProducer(
        new ImageSource(ImageSourceType.DIRECTORY, new ImageSourcePath(directory, extensions))
    );
};
/**
 * Create an ImageFileProducer instance with files open in Adobe as the source
 */
ImageFileProducer.withOpenFiles = function() 
{
    // TODO: Add outputDirectory, and processedDirectory options here
    return new ImageFileProducer(
        new ImageSource(ImageSourceType.OPENFILES, null)
    );
};
/**
 * Create an ImageFileProducer which emits a single empty string for a file path
 */
ImageFileProducer.withBlank = function() 
{
    // TODO: Add outputDirectory, and processedDirectory options here
    return new ImageFileProducer( 
        new ImageSource(ImageSourceType.BLANK, null)
    );
};
/**
 * Create an ImageFileProducer instance with the current active file in Adobe as the source
 */
ImageFileProducer.withActiveDocument = function() 
{
    // TODO: Add outputDirectory, and processedDirectory options here
    return new ImageFileProducer(
        new ImageSource(ImageSourceType.ACTIVEDOCUMENT, null)
    );
};