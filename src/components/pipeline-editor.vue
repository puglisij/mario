<template>
    <div>
        <div id="rete"></div>
        <button class="topcoat-button--large" type="submit" @click="onRun">Run</button>
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
import { ActionResizeImageComponent } from '@/rete/generated-components/action.resizeImage';
import Socket from '@/rete/sockets';

import global from '../global';


export default {
    // TODO Rete.js editor
    name: "pipeline-editor", 
    local: {
        editor: null,
        engine: null
    },
    computed: {
        cs() { return global.cs; }
    },
    methods: {
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

            await engine.abort();
            await engine.process(editor.toJSON(), 1, (name, inputs) => {
                return this.runAction(name, inputs);
            });
        }
    },
    mounted() {
        // Communication between nodes
        const container = document.querySelector('#rete');
        const editor = this.$options.local.editor = new Rete.NodeEditor('demo@0.1.0', container);
        editor.use(ContextMenuPlugin);
        editor.use(ConnectionPlugin);
        editor.use(VueRenderPlugin);

        const startComponent = new StartComponent();
        const actionResizeImageComponent = new ActionResizeImageComponent();
        editor.register(startComponent);
        editor.register(actionResizeImageComponent);
        
        const engine = this.$options.local.engine = new Rete.Engine('demo@0.1.0');
        engine.register(startComponent);
        engine.register(actionResizeImageComponent);

        
        
        editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => 
        {

        });
        editor.fromJSON({
            "id": "demo@0.1.0",
            "nodes": {
                "1": {
                    "id": 1,
                    "data": {
                        "w": "256px",
                        "h": "256px"
                    },
                    "inputs": {
                        "act": {
                            "connections": []
                        }
                    },
                    "outputs": { 
                        "continue": {
                            "connections": []
                        }
                    },
                    "position": [250, 0],
                    "name": "action.resizeImage"
                }, 
                "2": {
                    "id": 2,
                    "data": {},
                    "inputs": {},
                    "outputs": {
                        "then": {
                            "connections": [{
                                "node": 1, 
                                "input": "act",
                                "data": {}
                            }]
                        }
                    },
                    "name": "Start",
                    "position": [0, 0]
                }
            }
        }).then(() => editor.trigger('process'));

        // (async function(){
        //     let node = await numComponent.createNode({});
        //         node.position - [100, 100];
        //     editor.addNode(node);
        // }())
        
 
        editor.view.resize();
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
                background: rgba(130, 153, 255, 0.8);
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