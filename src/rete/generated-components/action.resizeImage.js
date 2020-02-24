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

    builder(node) {
        // Rules for parameters given in JSDoc comment
        //  - dont use if it has no description
        //  - default to 'text' type if no type is given 
        //  - if parameter receives more than one type of primitive, default to type 'text'?  (e.g. Number|String)
        // show parameter if
        //      - its required
        //      - its optional and has a default value and default value is defined
        // hide parameter if
        //      - its optional and has no default value or default value is not defined
        // 
        // parameters are also inputs (to allow programmable values)
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