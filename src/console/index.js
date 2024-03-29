import upath from "upath";
import { EventEmitter } from "events";
import fs from "fs";
import fsx from '../fsx';
import global from '../global';
import store from '../store';
import utils from '../utils';
import CircleBuffer from '@/circleBuffer';

const CONSOLE_METHODS = ["log", "warn", "error"];

class Logger extends EventEmitter
{
    constructor()
    {
        super();
        this.initialized = false;
        this.options = {
            logDirectory: "",
            logFilePersistForDays: 7 // number of files/days to keep
        };
        this.originalConsoleMethods = {};
        this.logWriteStream = null;
        this.currentLogFileMonthDay = 0;
        this.htmlLogBuffer = null;
    }
    /**
     * @returns {Promise}
     */
    async init() 
    {
        if(this.initialized)
            return;

        this.initialized = true;
        this.options = {
            logDirectory: store.general.logDirectory || global.appDefaultLogPath, 
            logFilePersistForDays: store.general.logFilePersistForDays > 0 ? store.general.logFilePersistForDays : 3,
            logHtmlBufferMaxSize: store.general.logHtmlBufferMaxSize > 0 ? store.general.logHtmlBufferMaxSize : 256
        };
        this.htmlLogBuffer = new CircleBuffer(this.options.logHtmlBufferMaxSize);

        // Proxy default console logging methods
        CONSOLE_METHODS.forEach(function(method)
        {
            const self = this;
            const originalMethod = console[method].bind(console);
            this.originalConsoleMethods[method] = originalMethod;

            console[method] = function() {
                const args = Array.prototype.slice.call(arguments);
                originalMethod.apply(
                    console,
                    args
                );
                self._write(method, args);
            };
        }.bind(this));

        await this._createLogsDirectory();
        await this._createFileStream();

        this.emit("initialized");
        console.log(`Logger initialized.\n\t${this.options.logDirectory}`);
    }
    async _write(method, args)
    {
        const date = new Date();
        const chunk = [date.toLocaleTimeString(), `[${method.toUpperCase()}]\t`, ...args, `\n`].join(" ");
        const htmlChunk = [`<div class="${method}">${date.toLocaleTimeString()}`, ...args, `</div>`].join(" ");
        
        if(date.getDate() !== this.currentLogFileMonthDay) {
            await this._createFileStream();
        }
        this.logWriteStream && this.logWriteStream.write(chunk);
        this.htmlLogBuffer.push(htmlChunk);
        this.emit("logs");
    }
    _createLogsDirectory() 
    {
        return new Promise((resolve, reject) => {
            fsx.mkdir(this.options.logDirectory, { recursive: true }, err => {
                if(err && err.code !== "ENOENT") reject(`${err}\nCould not create directory.`);
                else resolve();
            });
        });
    }
    _createFileStream()
    {
        this._closeFileStream();
        this._cleanupOldFiles();

        const date = new Date();
        this.currentLogFileMonthDay = date.getDate(); 

        const logPath = upath.join(this.options.logDirectory, `mario-${utils.yyyymmdd()}.logs`);
        return fsx.createFileAndStatSize(logPath)
        .then(size => 
        {
            this.logWriteStream = fs.createWriteStream(logPath, {
                flags: "r+", // Note 'a' flags don't work with networked Mac drives
                encoding: "utf8",
                autoClose: true, // close on error or end
                start: size
            });
            this.logWriteStream.on("error", error => {
                // TODO: Attempt to create stream again?
                this._closeFileStream();
                console.log(`Log file stream error.\n${error}`)
            });
            this.logWriteStream.on("close", event => {
                this._closeFileStream();
                console.log(`Log file stream closed.`);
            });
            return this.logWriteStream;
        });;
    }
    _closeFileStream()
    {
        if(this.logWriteStream) {
            this.logWriteStream.removeAllListeners();
            this.logWriteStream.end();
            this.logWriteStream = null;
        }
    }
    _cleanupOldFiles()
    {
        fs.readdir(this.options.logDirectory, (err, paths) => 
        {
            if(err) {
                return;
            }
            const logFilenames = paths.filter(name => name.endsWith(".logs"));
                  logFilenames.sort(); // sort by date
                  logFilenames.pop(); // don't delete todays
            const logPaths = logFilenames.map(name => upath.join(this.options.logDirectory, name));
            const howManyToDelete = Math.max(logPaths.length - this.options.logFilePersistForDays, 0);

            for(let i = 0; i < howManyToDelete; ++i) 
            {
                fs.unlink(logPaths[i], err => {
                    if(err) console.error("Could not delete log file. ", err);
                });
            }
        });
    }
    /**
     * Clear all the buffered html logs
     */
    clear() 
    {
        this.htmlLogBuffer.clear();
    }
    /**
     * Read all buffered logs formatted with html
     * @returns {string}
     */
    read()
    {
        return this.htmlLogBuffer.toArray().reduce((acc, val) => `${acc}${val}`, ``);
    }
    /**
     * Should be called to release internal resources
     */
    destroy() 
    {
        console.log("Logger destroyed.");

        if(!this.initialized) 
            return;
        this.initialized = false;

        this._closeFileStream();

        // Restore console methods
        CONSOLE_METHODS.forEach(method => {
            console[method] = this.originalConsoleMethods[method];
        });

        logger = null;
    }
}

let logger = new Logger();
export default logger;