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
        this.options = {};
        this.originalConsoleMethods = {};
        this.logWriteStream = null;
        this.isWritingToStream = false;
        this.lastLogFileMonthDay = 0;
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
            logFileRetryEverySec: 3,
            logFilePersistForDays: store.general.logFilePersistForDays > 0 ? store.general.logFilePersistForDays : 3,
            logHtmlBufferMaxSize: store.general.logHtmlBufferMaxSize > 0 ? store.general.logHtmlBufferMaxSize : 256
        };
        this.htmlLogBuffer = new CircleBuffer(this.options.logHtmlBufferMaxSize);
        this.logBuffer = new CircleBuffer(1024);

        await this._createLogsDirectory();
        this._cleanupOldFiles();

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

        this.emit("initialized");
        console.log(`Logger initialized.\n\t${this.options.logDirectory}`);
    }
    async _write(method, args)
    {
        const date = new Date();
        const chunk = [date.toLocaleTimeString(), `[${method.toUpperCase()}]\t`, ...args, `\n`].join(" ");
        const htmlChunk = [`<div class="${method}">${date.toLocaleTimeString()}`, ...args, `</div>`].join(" ");
        
        this.logBuffer.push(chunk);
        this.htmlLogBuffer.push(htmlChunk);
        this.emit("logs");

        this._writeToFile();
    }
    async _writeToFile() 
    {
        if(this.isWritingToStream || this.waitingToWriteToFile || this.logBuffer.length() == 0) return;
        this.isWritingToStream = true;

        // Rotate log files / Create file stream
        const day = new Date().getDate();
        if (day != this.lastLogFileMonthDay || !this.logWriteStream) {
            await this._createFileStream();
            this.lastLogFileMonthDay = day;
        }

        if(this.logWriteStream) {
            const chunk = this.logBuffer.toArray().reduce((acc, val) => `${acc}${val}`, ``);
            this.logBuffer.clear();
            this.logWriteStream.write(chunk);
            this.isWritingToStream = false;
        }
    }
    _waitAndStartWriteToFile() 
    {
        console.log(`Retrying write to log file in ${this.options.logFileRetryEverySec}sec...\n`);
        this.waitingToWriteToFile = true;
        setTimeout(() => { 
            console.log(`Retrying write to log file now.`);
            this.waitingToWriteToFile = false;
            this._writeToFile();
        }, 
        this.options.logFileRetryEverySec * 1000);
    }
    _createLogsDirectory() 
    {
        return fsx.mkdir(this.options.logDirectory, { recursive: true });
    }
    _createFileStream()
    {
        this._closeFileStream();

        const logPath = upath.join(this.options.logDirectory, `mario-${utils.yyyymmdd()}.logs`);
        return fsx.createFileAndStatSize(logPath)
        .then(size => 
        {
            console.log(`Log file created ${logPath}`);
            this.logWriteStream = fs.createWriteStream(logPath, {
                flags: "r+", // Note 'a' flags don't work with networked Mac drives
                encoding: "utf8",
                autoClose: true, // close on error or end
                start: size
            });
            this.logWriteStream.on("finish", () => { });
            this.logWriteStream.on("end", () => {
                console.warn(`Log file stream ended.`);
            });
            this.logWriteStream.on("error", error => {
                this._closeFileStream();
                this._waitAndStartWriteToFile();
                console.error(`Log file stream closed with error. \n${error}`);
            });
            this.logWriteStream.on("close", event => {
                this._closeFileStream();
                console.warn(`Log file stream closed.`);
            });
        });
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
        console.log("Logger deleting old log files...");

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
                console.log(`Logger deleting ${logPaths[i]}`);
                fs.unlink(logPaths[i], err => {
                    if(err) console.error("Could not delete log file. ", err);
                });
            }
        });

        // Schedule to run again tomorrow at 00:00:01
        const now = new Date();
        const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const msToMidnight = night.getTime() - now.getTime();
        setTimeout(() => { this._cleanupOldFiles() }, msToMidnight);
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