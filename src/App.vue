<template>
  <div id="app">
    <!-- This is the root of your panel -->
    <!-- Content should go inside #app -->
    <!--  <img alt="Vue logo" src="./assets/logo.png" /> -->
    <h1>Image Processor</h1>
    <notifications group="mario" 
                   position="top left"
                   :max="1" /> 



    <!-- Utility component to handle context and flyout menus -->
    <menus />
    <server />
    <jsx />
  </div>
</template>

<script>
/* npm modules  (Alternatively use cep_node.require) */ 
import upath from 'upath';
import starlette from "starlette";
import { mapState, mapGetters } from 'vuex';

/* local modules */
import menus from "./components/menus.vue";
import server from "./components/server.vue";
import jsx from "./components/jsx.vue";


// BEST PRACTICE: Props down, Events Up
export default {
    name: "app",
    components: {
        menus,
        server,
        jsx
    },
    data: () => {
        return {

        }
    },
    created() {
        // Jsx imports
        this.importJSX("utils.jsx");

        console.log(`App mounted.\n
            Extension Path: ${this.extensionPath}\n
            Host Path: ${this.hostPath}`);
    },
    mounted() {
        // Dynamic CSS variables that automatically handle all app themes and changes:
        // https://github.com/Inventsable/starlette
        starlette.init();
    },
    computed: {
        ...mapState(['cs', 'extensionPath', 'hostPath'])
    },
    methods: {
        importJSX(fileName) {
            let importPath = upath.join(this.hostPath, fileName);
            this.cs.evalScript('try{ var file = File("' + importPath + '").fsName; $.evalFile(file); }catch(e){ alert("File: " + file + " Import Exception: " + e); }');
        },
        dispatchEvent(name, data) {
            var event = new CSEvent(name, "APPLICATION");
                event.data = data;
            this.cs.dispatchEvent(event);
        }
    }
};
</script>

<style>
/* Various helper styles to match application theme */
@import url("https://fonts.googleapis.com/css?family=Open+Sans&display=swap");
:root {
  --quad: cubic-bezier(0.48, 0.04, 0.52, 0.96);
  --quart: cubic-bezier(0.76, 0, 0.24, 1);
  --quint: cubic-bezier(0.84, 0, 0.16, 1);

  background-color: var(--color-bg);
  color: var(--color-default);
  font-family: "Open Sans", sans-serif;
  font-size: 10px;
}

#app::-webkit-scrollbar {
  display: block;
}
body::-webkit-scrollbar {
  width: 0px;
}

::-webkit-scrollbar {
  background-color: var(--color-scrollbar);
  width: var(--width-scrollbar-track);
}
::-webkit-scrollbar-thumb {
  width: var(--width-scrollbar-track);
  background: var(--color-scrollbar-thumb);
  border-radius: var(--radius-scrollbar-thumb);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover);
}
::-webkit-scrollbar-resizer {
  display: none;
  width: 0px;
  background-color: transparent;
}
::-webkit-scrollbar-button {
  height: 0px;
}
::-webkit-scrollbar-corner {
  display: none;
}

button {
    background: var(--color-bg);
    color: var(--color-default);
}
</style>
