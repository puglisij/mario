import { Control } from 'rete';
import VueInputControl from './input-control.vue';

export class InputControl extends Control 
{
    constructor(emitter, key, type, readonly, required, initial) 
    {
        super(key);
        this.component = VueInputControl;
        this.props = { emitter, ikey: key, type, readonly, required, initial, change: () => this.onChange() };
    }

    setValue(value) 
    {
        const ctx = this.vueContext || this.props;
        ctx.value = value;
    }

    onChange() {}
}