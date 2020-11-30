import { Control } from 'rete';
import VueInputControl from './input-control.vue';

export class InputControl extends Control 
{
    constructor(emitter, key, types, initial, required) 
    {
        super(key);
        this.component = VueInputControl;
        this.props = { 
            emitter, 
            ikey: key, 
            types, 
            initial, 
            required, 
            change: () => this.onChange() 
        };
    }

    setValue(value) 
    {
        const ctx = this.vueContext || this.props;
        ctx.value = value;
    }

    onChange() {}
}