import upath from "upath";
import fs from "fs";
import { EventEmitter } from "events";

const CONSOLE_METHODS = ["log", "warn", "error"];

class Logger extends EventEmitter
{
    constructor()
    {
        super();
        this.initialized = false;
        this.options = {
            logDirectory: "./",
            logFileEnabled: false
        };
        this.originalConsoleMethods = {};
        this.logWriteStream = null;
        this.logBuffer = [];
        this.maxBufferSize = 64;
    }
    /**
     * Initialize logging with the given options
     * @param {object} [options]
     * @param {String} [options.logDirectory = "./"] the directory location where log files are written
     */
    init(options) 
    {
        if(this.initialized)
            return;
        this.initialized = true;

        this.options = Object.assign(this.options, options || {});
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
    close() 
    {
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