<template>
  <div id="app">
    <!-- This is the root of your panel -->
    <!-- Content should go inside #app -->
    <!--  <img alt="Vue logo" src="./assets/logo.png" /> -->
    <h1>Mario</h1>
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
import { mapState, mapGetters } from 'vuex';

/* local modules */
import themeManager from "./themeManager";
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
    /**  
     * about to be initialized. data is not yet reactive 
     */
    beforeCreate() {},
    /**  
     * events and data observation setup. not yet in native DOM. access data here, not in mounting hooks 
     */
    created() {
        // Jsx Environment Setup
        this.importJSX("utils.jsx");
        this.importJSX("polyfil.jsx");
        this.importJSX("image.jsx"); // import this here?

        console.log(`App mounted.\n
            Extension Path: ${this.extensionPath}\n
            Host Path: ${this.hostPath}\n
            Host Action Path: ${this.hostActionPath}`);
    },
    /**  
     * right before render happens. template compiled and virtual DOM update by vue.  
     */
    beforeMount() {},
    /**  
     * $el added and native DOM updated. do modify DOM for integration of non-Vue libraries here.
     */
    mounted() {
        themeManager.init();
    },
    /**  
     * data has changed and update cycle starting. do get data before actually is rendered. 
     */
    beforeUpdate() {},
    /**  
     * data changed and native DOM updated. do access DOM after property changes here. 
     */
    updated() {},
    /**  
     * about to teardown. still fully present and functional. do cleanup events, and subscriptions 
     */
    beforeDestroy() {},
    /**  
     * nothing left on your component. do last minute cleanups, etc. 
     */
    destroyed() {},
    computed: {
        ...mapState(['cs', 'extensionPath', 'hostPath', 'hostActionPath'])
    },
    methods: {
        importJSX(fileName) {
            let importPath = upath.join(this.hostPath, fileName);
            this.cs.evalScript('try{ var file = File("' + importPath + '").fsName; $.evalFile(file); }catch(e){ alert("File: " + file + " Import Exception: " + e); }', result => {
                console.log("Jsx File Imported: " + importPath + " Result: " + result);
            });
        },
        dispatchEvent(name, data) {
            var event = new CSEvent(name, "APPLICATION");
                event.data = data;
            this.cs.dispatchEvent(event);
        }
    }
};
</script>

<style lang="scss">
/* Various helper styles to match application theme */
@import url("http://fonts.googleapis.com/css?family=Source+Sans+Pro:300");
@import url("http://fonts.googleapis.com/css?family=Source+Code+Pro");

html,body {
    margin: 0;
    padding: 0;
    height: 100%;
}
body {
    font-family: source-sans-pro, sans-serif;
    padding: .5em;

    &.light {
        background: #F4F4F4;
        color: #181919;
    }
    &.dark {
        color: #F0F1F1;
        background: #4A4D4E;
    }
}

h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 1em 0;
}
h2 {
    font-size: 16px;
    font-weight: 300;
}
h3 {
    font-size: 14px;
    font-weight: 400;
}

section {
    margin: 10px 0;
}

#app::-webkit-scrollbar {
  display: block;
}
body::-webkit-scrollbar {
  width: 0px;
}
/* ::-webkit-scrollbar {
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
} */
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
</style>
