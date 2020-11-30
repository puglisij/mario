import { Socket } from 'rete';

/** 
 * Sockets are used to determine which inputs and outputs can be connected to each other
 * The passed parameter must be unique. According to it, a CSS class will be created in the kebab-case
*/
export default {
    num: new Socket('Number value'),
    str: new Socket('String value'),
    input: new Socket('Act'), // generic input value
    output: new Socket('Then') // generic output value
}
