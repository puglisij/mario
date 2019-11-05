import upath from "upath";
import fs from "fs";



//
// class Logger extends ReadStream
// {
//     constructor()
//     {
//         this.options = {};
//         this.buffer = [];
//         this.writeStream = null;

//         ["log", "warn", "error"].forEach(function(method)
//         {
//             const oldMethod = console[method].bind(console);
//             console[method] = function() {
//                 const args = Array.prototype.slice.call(arguments);
//                 oldMethod.apply(
//                     console,
//                     args
//                 );
//                 _buffer(args);
//             };
//         });
//     }
//     // TODO make async
//     _buffer(args)
//     {
//         // write to read buffer
//         const chunk = [new Date().toLocaleTimeString(), ...args, "\n"].join(" ");
//         const chunkLength = (chunk.length > READ_BUFFER_SIZE) ? READ_BUFFER_SIZE : chunk.length;
//         for(let i = 0; i < chunkLength; ++i) {
//             memoryReadBuffer[memoryReadBufferStart + i] = chunk[i];
//         }
//         memoryReadBufferStart = (memoryReadBufferStart + chunkLength) % READ_BUFFER_SIZE;

//         // write to stream
//         // TODO wait for "drain" event if buffer is full before writing again, else high memory usage or crashes
//         //      Maybe push data to readStream instead and pipe to writeStream?
//         if (writeStream && writeStream.writable) {
//             writeStream.write(chunk);
//         }
//     }
//     init(options)
//     {
//         this.options = options;
//         const path = upath.join(options.directory, ".logs");

//         // create or empty log file
//         fs.writeFileSync(path, "", {
//             flag: "w"
//         });

//         this.writeStream = fs.createWriteStream(path, {
//             encoding: "utf8"
//         });
//         console.log("Logger initialized.");
//     }
//     close() 
//     {
//         this.writeStream && this.writeStream.end();
//         this.writeStream = null;
//         console.log("Logger destroyed.");
//     }

// }
// function read()
// {
//     let front = memoryReadBuffer.slice(memoryReadBufferStart).toString();
//     let tail = memoryReadBufferStart > 0 ? memoryReadBuffer.slice(0, memoryReadBufferStart - 1).toString() : "";
//     return front.concat(tail);
// }

// export default {
//     init,
//     close,
//     read
// }