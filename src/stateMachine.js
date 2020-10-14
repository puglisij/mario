export default class StateMachine
{
    constructor(definition) {
        this.stateName = definition.initialState;
        this.states = definition.states;
    }
    transition(event) {
        const fromStateDefinition = this.states[this.stateName];
        const transition = fromStateDefinition.transitions[event];
        if(!transition) {
            throw new Error(`Transition ${targetStateName} does not exist for the current state ${this.stateName}.`);
        }

        const toStateDefinition = this.states[transition.target];
        toStateDefinition.action?.();
        fromStateDefinition.actions.onExit();
        toStateDefinition.actions.onEnter();

        return this.stateName = transition.target;
    }
}

/*
    const machine = createMachine({
        initialState: 'off',
        states: {
            off: {
                actions: {
                    onEnter() {
                        console.log('off: onEnter')
                    },
                    onExit() {
                        console.log('off: onExit')
                    },
                },
                transitions: {
                    switch: {
                        target: 'on',
                        action() {
                            console.log('transition action for "switch" in "off" state')
                        },
                    },
                },
            },
            on: {
                actions: {
                    onEnter() {
                        console.log('on: onEnter')
                    },
                    onExit() {
                        console.log('on: onExit')
                    },
                },
                transitions: {
                    switch: {
                        target: 'off',
                        action() {
                            console.log('transition action for "switch" in "on" state')
                        },
                    },
                },
            },
        }
    })
*/