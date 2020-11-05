import { Component, Input, Output } from 'rete';
import Socket from '../sockets';
import { InputControl } from '../controls/input/index';


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
        node.data.w = inputs.w[0] || node.data.w;
        node.data.h = inputs.h[0] || node.data.h;

        // runAction returns a Promise
        // result of Promise is assigned to outputData
        return runAction(node.name, node.data);
    }
}