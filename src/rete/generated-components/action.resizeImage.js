import { Component, Input, Output } from 'rete';
import Socket from '../sockets';
import { InputControl } from '../controls/input/index';

/**
* Changes the size of the active document image
* For method, BICUBIC is good for enlargement, BILINEAR is good for reduction
* @param {object} options 
* @param {string} options.w the width unit e.g. "300px" 
* @param {string} [options.h] the height unit. Defaults to width if not defined
* @param {bool} [options.constrain = true] true to constrain proportion aspect ratio
* @param {number} [options.resolution] the pixels per inch density. default is active document resolution
* @param {number} [options.reduceNoise] the integer percentage noise value for noise reduction (only valid for XResampleMethod.PRESERVEDETAILS and XResampleMethod.PRESERVEDETAILS2)
* @param {XResampleMethod|String} [options.method = XResampleMethod.BICUBICSMOOTHGRADIENTS] the resampling method enumeration value e.g. XResampleMethod.BILINEAR
*/
// ^ parse this with JSDoc, gather parameter data



export class ActionResizeImageComponent extends Component 
{
    constructor() {
        super("action.resizeImage");
    }

    builder(node) 
    {
        var inpWidth = new Input("w", "Width", Socket.input, false);
        var inpHeight = new Input("h", "Height", Socket.input, false);

        inpWidth.addControl(new InputControl(this.editor, "w", "text"))
        inpHeight.addControl(new InputControl(this.editor, "h", "text"))

        var inpAct = new Input("act", "Act", Socket.action);
        var outThen = new Output('then', "Then", Socket.action);

        return node
            .addInput(inpWidth)
            .addInput(inpHeight)
            .addInput(inpAct)
            .addOutput(outThen);
    }

    worker(node, inputs, outputs, runAction) 
    {
        // runAction returns a Promise
        return runAction(node.name, node.data);
    }
}