<template>
    <div>
        <div id="rete"></div>
        <button class="topcoat-button--large" type="submit" @click="onRun">Run</button>
        <button class="topcoat-button--large" type="submit" @click="onActionAdd">Add Action</button>
        <button class="topcoat-button--large" type="submit" @click="onGetJson">Get JSON</button>
        <div id="rete-json">{{json}}</div>
    </div>
</template>

<script>
/* npm modules */
import Rete from "rete"; 
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from 'rete-context-menu-plugin';
import VueRenderPlugin from "rete-vue-render-plugin";

/* local modules */
import appGlobal from '../global';
import Server from '../server';
import SelectPipelineAction from "@/dialog/select-pipeline-action.vue";

let _editor = null;
let _engine = null;

export default {
    name: "APipelineEditor", 
    local: {
        editor: null,
        engine: null
    },
    props: {
        pipelineBeingEdited: {
            type: Object, 
            required: false
        }
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
            const engine = _engine;
            const editor = _editor;
            if(editor.silent) return;

            // engine.process() returns a 'success' or 'aborted' string when Promise resolves
            await engine.abort();
            await engine.process(editor.toJSON(), 1, (name, inputs) => {
                return this.runAction(name, inputs);
            });
        },
        onGetJson() 
        {
            this.json = _editor.toJSON();
        },
        onActionAdd(event)
        {
            // TODO: Action parameters should be fixed/baked-in and only values editable
            this.$dialog.open({
                component: SelectPipelineAction, 
                listeners: {
                    onSelect: async (actionComponent) => 
                    {      
                        // NOTE: createNode() is a passthrough to the .builder() function.
                        // It takes one parameter - the data to be assigned to the node before its built.
                        const area = _editor.view.area;
                        const offset = [area.transform.x, area.transform.y];
                        const position = [
                            ~~(area.container.clientWidth / 2) - offset[0], 
                            ~~(area.container.clientHeight / 2) - offset[1]
                        ];
                        const node = await actionComponent.createNode({});
                              node.position = position; 

                        _editor.addNode(node);
                    }
                }
            });
        },
        onActionDelete(id)
        { 
            this.$dialog.openConfirm({
                name: "confirm",
                message: "Delete this action??",
                onYes: () => {
                    // TODO: Remove from pipeline configuration
                }
            });
        }
    },
    mounted() 
    {
        // Create Editor Instance
        const container = document.querySelector('#rete');
        const editor = _editor = new Rete.NodeEditor('demo@0.1.0', container);
        const engine = _engine = new Rete.Engine('demo@0.1.0');

        // Rete Plugins
        editor.use(ConnectionPlugin);
        editor.use(ContextMenuPlugin); // TODO: Fork ContextMenuPlugin and improve
        editor.use(VueRenderPlugin);

        // Get Component Instances from ActionComponentFactory
        Server.actions.getAllActionComponents()
        .then(actionComponents => 
        {
            // Register Components
            for(const c of actionComponents) {
                editor.register(c);
                engine.register(c);
            }
            // The same component instances should probably be shared between Engine and Editor
            // Benefits:
            // - Saves memory
            // - No need to reinstantiate when Editor is opened or Engine run
            // - The same editor instance can also be run by the Engine at a future point.
            
            // Load Pipeline Configuration into Editor
            // editor.fromJSON(pipelineBeingEdited);

            // Communication between nodes
            // Build Sockets ? 

            editor.view.resize();
        });

        // editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => 
        // {

        // });
        // editor.fromJSON({
        //     "id": "demo@0.1.0",
        //     "nodes": {
        //         "1": {
        //             "id": 1,
        //             "data": {},
        //             "inputs": {},
        //             "outputs": {
        //                 "then": {
        //                     "connections": [{ "node": 2, "input": "act", "data": {} }]
        //                 }
        //             },
        //             "position": [120, 270],
        //             "name": "Start"
        //         },
        //         "2": {
        //             "id": 2,
        //             "data": { "w": "256px", "h": "256px" },
        //             "inputs": {
        //                 "w": {
        //                     "connections": [{ "node": 5, "output": "num", "data": {} }]
        //                 },
        //                 "h": { "connections": [] },
        //                 "act": {
        //                     "connections": [{ "node": 1, "output": "then", "data": {} }]
        //                 }
        //             },
        //             "outputs": { "then": { "connections": [] } },
        //             "position": [540, 0],
        //             "name": "action.resizeImage"
        //         },
        //         "3": {
        //             "id": 3,
        //             "data": { "num": 256 },
        //             "inputs": {},
        //             "outputs": {
        //                 "num": {
        //                     "connections": [{ "node": 5, "input": "num2", "data": {} }]
        //                 }
        //             },
        //             "position": [-200, 100],
        //             "name": "Number"
        //         },
        //         "4": {
        //             "id": 4,
        //             "data": { "num": 256 },
        //             "inputs": {},
        //             "outputs": {
        //                 "num": {
        //                     "connections": [{ "node": 5, "input": "num1", "data": {} }]
        //                 }
        //             },
        //             "position": [-200, -40],
        //             "name": "Number"
        //         },
        //         "5": {
        //             "id": 5,
        //             "data": { "preview": 0, "num1": 0, "num2": 0 },
        //             "inputs": {
        //                 "num1": {
        //                     "connections": [{ "node": 4, "output": "num", "data": {} }]
        //                 },
        //                 "num2": {
        //                     "connections": [{ "node": 3, "output": "num", "data": {} }]
        //                 }
        //             },
        //             "outputs": {
        //                 "num": {
        //                     "connections": [{ "node": 2, "input": "w", "data": {} }]
        //                 }
        //             },
        //             "position": [120, 0],
        //             "name": "Add"
        //         }
        //     }
        // }).then(() => editor.trigger('process'));
        // editor.view.resize();
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