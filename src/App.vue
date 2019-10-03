<template>
  <div id="app">
    <!-- This is the root of your panel -->
    <!-- Content should go inside #app -->
    <!--  <img alt="Vue logo" src="./assets/logo.png" /> -->
    <HelloWorld msg="Image Processor" />

    <button v-on:click="importDoc">Test</button>

    <!-- Utility component to handle context and flyout menus -->
    <menus />
  </div>
</template>

<script>
// You can access this App.vue file from any other component via `this.$root.$children[0]`
// See `./components/HelloWorld.vue` for example of CSInterface and this.app

// Create your own components and import them here
import HelloWorld from "./components/HelloWorld.vue";
import menus from "./components/menus.vue";

// Dynamic CSS variables that automatically handle all app themes and changes:
// https://github.com/Inventsable/starlette
import starlette from "starlette";

export default {
    name: "app",
    components: {
        HelloWorld,
        menus
    },
    data: () => ({
        csInterface: null,
        extensionDirectory: null
    }),
    mounted() {
        this.csInterface = new CSInterface();
        this.extensionDirectory = this.csInterface.getSystemPath("extension");
        // Open the server extension
        this.csInterface.requestOpenExtension("com.a-new-hope.server", "");

        console.log("App mounted.");
        starlette.init();
    },
    methods: {
        dispatchEvent(name, data) {
            var event = new CSEvent(name, "APPLICATION");
                event.data = data;
            this.csInterface.dispatchEvent(event);
        },
        loadScript(path) {
            this.csInterface.evalScript(`$.evalFile('${path}')`);
        },
        importDoc() {
            console.log("Importing image...");
            /* Make sure to include the full URL */
            var url = "http://localhost:3200/import";

            /* Use fetch to communicate with your server */
            // TODO: use fetch()
            fetch(new Request(url, {
                method: 'get',
                headers: new Headers({
                    'directory': this.extensionDirectory
                })
            }))
            .then(function(response) {
                return response.blob();
            })
            .then(function(data) {
                csInterface.evalScript(`openDocument("${data}")`);
            })
            .catch(function(err) {

            });
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
