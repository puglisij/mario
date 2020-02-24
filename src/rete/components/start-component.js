import { Component, Input, Output } from 'rete';
import Socket from '../sockets';


export class StartComponent extends Component 
{
    constructor() {
        super("Start");
    }

    builder(node) {
        var out1 = new Output('then', "Then", Socket.action, false);
        return node.addOutput(out1);
    }

    worker(node, inputs, outputs) {}
}