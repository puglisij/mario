<template>
  <div id="app">
    <a-dialog name="confirm"></a-dialog>
    <adobe-menus />

    <tabs @changed="onTabChanged" :initial-tab="currentTabComponent">
        <tab title="the-console">Console</tab>
        <tab title="the-jsx-runner">Jsx</tab>
        <!-- <tab title="the-configurator">Configuration</tab>
        <tab title="the-pipelines">Pipelines</tab> -->
    </tabs>

    <section class="tab-content">
        <keep-alive exclude="ThePipelines, TheConfigurator">
            <component :is="currentTabComponent"></component>
        </keep-alive>
    </section>
  </div>
</template>

<script>
/* Can also use cep_node.require */
/* npm modules */ 
import upath from 'upath'; 

/* local modules */
import store from './store';
import themeManager from "./themeManager";
import Tabs from './components/tabs';
import Tab from './components/tab';

export default {
    name: "app",
    components: {
        Tabs, 
        Tab,
        AdobeMenus: () => import("./components/adobe-menus.vue"),
        TheJsxRunner: () => import("./components/the-jsx-runner.vue"),
        //TheServer: () => import("./components/the-server.vue"),
        //TheConfigurator: () => import("./components/the-configurator.vue"),
        //ThePipelines: () => import("./components/the-pipelines.vue")
    },
    data: () => {
        return {
            currentTabComponent: store.general.currentTab
        }
    },
    mounted() {
        themeManager.init();
        this.hideLoadingSpinner();
    },
    methods: {
        onTabChanged(tabTitle) {
            store.general.currentTab = tabTitle;
            this.currentTabComponent = tabTitle;
        },
        hideLoadingSpinner() {
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
@import "./styles/columns";

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
        color: $dark-text-color;
        background: $dark-bg;
    }
    * {
        box-sizing: border-box;
    }
}

h1, h2, h3 {
    margin: 0 0 0.5em 0;
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

#app {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.tab-content {
    flex-grow: 1;
    flex-shrink: 1;
    padding: .5em;

    @at-root .dark & {
        border: 1px solid $dark-section-border;
    }
    @at-root .light & {
        border: 1px solid $light-section-border;
    }
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
