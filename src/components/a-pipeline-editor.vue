<template>
    <div>
        <div id="rete"></div>
        <button class="topcoat-button--large" type="submit" @click="onRun">Run</button>
        <button class="topcoat-button--large" type="submit" @click="onGetJson">Get JSON</button>
        <div id="rete-json">{{json}}</div>
    </div>
</template>

<script>
/* npm modules */
import Rete from "rete"; 
import ContextMenuPlugin from 'rete-context-menu-plugin';
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

/* local modules */
import { NumComponent } from '@/rete/components/num-component';
import { StartComponent } from '@/rete/components/start-component';
import { AddComponent } from '@/rete/components/add-component';
import { ActionResizeImageComponent } from '@/rete/generated-components/action.resizeImage';
import Socket from '@/rete/sockets';

import appGlobal from '../global';


export default {
    // TODO Rete.js editor
    name: "APipelineEditor", 
    local: {
        editor: null,
        engine: null
    },
    data() {
        return {
            json: ""
        }
    },
    computed: {
        cs() { return appGlobal.csInterface; }
    },
    methods: {
        // Temporary: Delete me
        runAction(psActionName, actionParameters) 
        {
            const psActionParameters = JSON.stringify(actionParameters);
            console.log(`Running Action: ${psActionName}(${psActionParameters})`);
            return this.runJsx(`(function(){
                try {
                    var result = ${psActionName}(${psActionParameters});
                    return result;
                } catch(e) {
                    return e.toString();
                }
            }())`);
        },
        // Temporary: Delete me
        runJsx(jsxString) 
        {
            return new Promise((resolve, reject) => 
            {
                this.cs.evalScript(jsxString, function(result) 
                {
                    if(result.toLowerCase().includes("error") 
                    || result.toLowerCase().includes("exception")) {
                        const errorMessage = `Jsx: \n\t${jsxString}\nResult:\n${result}`;
                        console.error(errorMessage);
                        reject(errorMessage);
                    } else {
                        resolve(result)
                    }
                });
            })
        },
        async onRun()
        {
            const engine = this.$options.local.engine;
            const editor = this.$options.local.editor;
            if(editor.silent) return;

            // engine.process() returns a 'success' or 'aborted' string when Promise resolves
            await engine.abort();
            await engine.process(editor.toJSON(), 1, (name, inputs) => {
                return this.runAction(name, inputs);
            });
        },
        onGetJson() 
        {
            this.json = this.$options.local.editor.toJSON();
        }
    },
    mounted() {
        // Create Editor Instance
        // Get Component Instances from ActionsManager
        // Register Components
        // Load Pipeline Configuration into Editor
        // 

        // Communication between nodes
        const container = document.querySelector('#rete');
        const editor = this.$options.local.editor = new Rete.NodeEditor('demo@0.1.0', container);
        editor.use(ContextMenuPlugin);
        editor.use(ConnectionPlugin);
        editor.use(VueRenderPlugin);

        const startComponent = new StartComponent();
        const numComponent = new NumComponent();
        const addComponent = new AddComponent();
        const actionResizeImageComponent = new ActionResizeImageComponent();
        editor.register(startComponent);
        editor.register(numComponent);
        editor.register(addComponent);
        editor.register(actionResizeImageComponent);
        
        const engine = this.$options.local.engine = new Rete.Engine('demo@0.1.0');
        engine.register(startComponent);
        engine.register(numComponent);
        engine.register(addComponent);
        engine.register(actionResizeImageComponent);

        
        
        editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => 
        {

        });
        editor.fromJSON({
            "id": "demo@0.1.0",
            "nodes": {
                "1": {
                    "id": 1,
                    "data": {},
                    "inputs": {},
                    "outputs": {
                        "then": {
                            "connections": [{ "node": 2, "input": "act", "data": {} }]
                        }
                    },
                    "position": [120, 270],
                    "name": "Start"
                },
                "2": {
                    "id": 2,
                    "data": { "w": "256px", "h": "256px" },
                    "inputs": {
                        "w": {
                            "connections": [{ "node": 5, "output": "num", "data": {} }]
                        },
                        "h": { "connections": [] },
                        "act": {
                            "connections": [{ "node": 1, "output": "then", "data": {} }]
                        }
                    },
                    "outputs": { "then": { "connections": [] } },
                    "position": [540, 0],
                    "name": "action.resizeImage"
                },
                "3": {
                    "id": 3,
                    "data": { "num": 256 },
                    "inputs": {},
                    "outputs": {
                        "num": {
                            "connections": [{ "node": 5, "input": "num2", "data": {} }]
                        }
                    },
                    "position": [-200, 100],
                    "name": "Number"
                },
                "4": {
                    "id": 4,
                    "data": { "num": 256 },
                    "inputs": {},
                    "outputs": {
                        "num": {
                            "connections": [{ "node": 5, "input": "num1", "data": {} }]
                        }
                    },
                    "position": [-200, -40],
                    "name": "Number"
                },
                "5": {
                    "id": 5,
                    "data": { "preview": 0, "num1": 0, "num2": 0 },
                    "inputs": {
                        "num1": {
                            "connections": [{ "node": 4, "output": "num", "data": {} }]
                        },
                        "num2": {
                            "connections": [{ "node": 3, "output": "num", "data": {} }]
                        }
                    },
                    "outputs": {
                        "num": {
                            "connections": [{ "node": 2, "input": "w", "data": {} }]
                        }
                    },
                    "position": [120, 0],
                    "name": "Add"
                }
            }
        }).then(() => editor.trigger('process'));


        editor.view.resize();
    },
    onActionAdd(event)
    {
        // TODO: Action parameters should be fixed/baked-in and only values editable
        // TODO: Should use normal Class instances here ActionDescriptor & ActionParameter?
        this.$dialog.open({
            component: SelectPipelineAction, 
            listeners: {
                onSelect: async (actionDescriptor) => {
                    // const actionName = actionDescriptor.name;
                    // get component by action name

                    //     createNode() is a passthrough to the .builder() function
                    //     It takes one parameter - the data to be assigned to the node before its built.
                    //     let node = await actionComponent.createNode({});
                    //         node.position = [100, 100];
                    //     editor.addNode(node);
                }
            }
        });
    },
    onActionDelete(id)
    {
        this.$dialog.openConfirm({
            name: "confirm",
            message: "Delete this action?",
            onYes: () => {
                // TODO: Remove from pipeline configuration
            }
        });
    }
}
</script>

<style lang="scss">
    #rete {
        height: 400px;
        width: 800px;

        .node{
            background: linear-gradient(#555 0%, #333333 100%);
            border-color: #6a6a6a;
            border-width: 1px;

            &.selected { 
                background: rgba(130, 153, 255, 0.5);
                border-color: transparent;
            }
        }
        .connection .main-path {
            stroke: #adadf7;
            stroke-width: 3px;
        }
        .socket {
            background: #adadf7;
            border: none;
        }
    }
</style>