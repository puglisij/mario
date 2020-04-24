import upath from "upath";
import fs from "fs";
import { EventEmitter } from "events";
import global from '../global';
import store from '../store';

const CONSOLE_METHODS = ["log", "warn", "error"];

class Logger extends EventEmitter
{
    constructor()
    {
        super();
        this.initialized = false;
        this.options = {
            logDirectory: "./",
            logFileEnabled: false,
            logFilePersistForDays: 7 // number of files/days to keep
        };
        this.originalConsoleMethods = {};
        this.logWriteStream = null;
        this.logBuffer = [];
        this.maxBufferSize = 64;
    }
    init() 
    {
        if(this.initialized)
            return;
        this.initialized = true;
        this.emit("initializing");

        this.options = {
            logDirectory: store.general.logDirectory || global.appDefaultLogPath, 
            logFileEnabled: true
        };
        this._cleanupFiles();
        this._createFileStream();

        // Override default console logging methods
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

        this.emit("initialized");
        console.log("Logger initialized");
    }
    _write(method, args)
    {
        // write to read buffer
        const chunk = [new Date().toLocaleTimeString(), `[${method.toUpperCase()}]\t`, ...args, `\n`].join(" ");
        const htmlChunk = [`<div class="${method}">${new Date().toLocaleTimeString()}`, ...args, `</div>`].join(" ");
        this.logWriteStream && this.logWriteStream.write(chunk);
        this.logBuffer.push(htmlChunk);

        this.emit("logs");
    }
    _createFileStream()
    {
        if(!this.options.logFileEnabled) {
            return;
        }
        const yyyymmdd = new Date().toISOString().slice(0,10);
        const logPath = upath.join(this.options.logDirectory, yyyymmdd + ".logs");
        this.logWriteStream = fs.createWriteStream(logPath, {
            flags: "a",
            encoding: "utf8"
        });
    }
    _closeFileStream()
    {
        this.logWriteStream && this.logWriteStream.end();
        this.logWriteStream = null;
    }
    /**
     * Erase old log files 
     */
    _cleanupFiles()
    {
        const paths = fs.readdirSync(this.options.logDirectory);
        const logFilenames = paths.filter(name => name.endsWith(".logs"));
              logFilenames.sort(); // sort by date
        const logPaths = logFilenames.map(name => upath.join(this.options.logDirectory, name));
        const howManyToDelete = Math.max(logPaths.length - this.options.logFilePersistForDays, 0);
        for(let i = 0; i < howManyToDelete; ++i) 
        {
            fs.unlink(logPaths[i], err => {
                if(err) console.error("Could not delete log file. ", err);
            });
        }
    }
    /**
     * Clear the buffered logs
     */
    clear() 
    {
        this.logBuffer = [];
    }
    /**
     * Read all buffered logs formatted with html
     * @returns {string}
     */
    read()
    {
        return this.logBuffer.reduce((acc, val) => `${acc}${val}`, ``);
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
        })
        logger = null;
    }
}

let logger = new Logger();
export default logger;