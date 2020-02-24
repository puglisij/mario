<template>
  <div id="app">
    <a-dialog name="confirm"></a-dialog>
    <!-- Utility component to handle context and flyout menus -->
    <menus />
    <server v-on:loaded="onServerLoaded"/>
  </div>
</template>

<script>
/* npm modules  (Alternatively use cep_node.require) */ 
import upath from 'upath';

/* local modules */
import appGlobal from "./global";
import themeManager from "./themeManager";

export default {
    name: "app",
    components: {
        menus: () => import("./components/menus.vue"),
        server: () => import("./components/server.vue")
    },
    data: () => {
        return {}
    },
    computed: {
        cs() { return appGlobal.cs; }
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
        this.importJSX("image.jsx"); 

        console.log(`App mounted.\n
            Extension Path: ${appGlobal.extensionPath}\n
            Host Path: ${appGlobal.hostPath}\n
            Host Action Path: ${appGlobal.hostActionPath}`);
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
    methods: {
        importJSX(fileName) {
            let importPath = upath.join(appGlobal.hostPath, fileName);
            this.cs.evalScript('try{ var file = File("' + importPath + '").fsName; $.evalFile(file); }catch(e){ alert("File: " + file + " Import Exception: " + e); }', result => {
                console.log("Jsx File Imported: " + importPath + " Result: " + result);
            });
        },
        dispatchEvent(name, data) {
            var event = new CSEvent(name, "APPLICATION");
                event.data = data;
            this.cs.dispatchEvent(event);
        },
        onYes() {
            console.log("modal yes");
        },
        onCancel() {
            console.log("modal cancel");
        }, 
        onServerLoaded() {
            let spinnerEl = document.getElementById("loading");
            if (spinnerEl) 
                spinnerEl.style.display = "none";
        }
    }
};
</script>

<style lang="scss">
/* Various helper styles to match application theme */
@import url("http://fonts.googleapis.com/css?family=Source+Sans+Pro:300");
@import url("http://fonts.googleapis.com/css?family=Source+Code+Pro");

html, body {
    margin: 0;
    padding: 0;
    height: 100%;
}
body {
    font-family: source-sans-pro, sans-serif;

    &.light {
        background: #F4F4F4;
        color: #181919;
    }
    &.dark {
        color: #F0F1F1;
        background: #4A4D4E;
    }
    * {
        box-sizing: border-box;
    }
}

h1, h2, h3 {
    margin: 0 0 1em 0;
}
h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0.5em;
}
h2 {
    font-size: 16px;
    font-weight: 300;
}
h3 {
    font-size: 14px;
    font-weight: 400;
}
h4 {
    font-size: 12px; 
    font-weight: 400;
}


.controls {
    margin: .5em 0;
}





#app::-webkit-scrollbar {
  display: block;
}
body::-webkit-scrollbar {
  width: 0px;
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

@mixin clearfix() {
  &::after {
    display: block;
    content: "";
    clear: both;
  }
}
.clearfix {
    @include clearfix();
}
</style>
