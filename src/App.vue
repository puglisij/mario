<template>
  <div id="app">
    <a-dialog-root />
    <adobe-menus />
    
    <tabs @changed="onTabChanged" :initial-tab="currentTabComponent">
        <tab title="the-console">Console</tab>
        <tab title="the-jsx-runner">Jsx</tab>
        <tab title="the-configurator">Configuration</tab>
        <tab title="the-pipelines">Pipelines</tab>
    </tabs>

    <start-stop />

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
import StartStop from './components/start-stop.vue';

export default {
    name: "app",
    components: {
        StartStop,
        Tabs, 
        Tab,
        AdobeMenus: () => import("./components/adobe-menus.vue"),
        TheConsole: () => import('./components/the-console.vue'),
        TheJsxRunner: () => import("./components/the-jsx-runner.vue"),
        TheConfigurator: () => import("./components/the-configurator.vue"),
        ThePipelines: () => import("./components/the-pipelines.vue")
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
    font-size: 14px;
    margin: 0;
    padding: 0;
    height: 100%;
}
body {
    font-family: source-sans-pro, sans-serif;
    line-height: 1.5rem;

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
.dark .text-highlight {
    color: $dark-text-highlight-color;
}


#app {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.tab-title {
    font-weight: bold;
    padding: .25rem .5rem;
    left: -.5rem;
    position: relative;
    width: 100vw;

    @at-root .dark & {
        background: #424242;
    }
}
.tab-content {
    flex-grow: 1;
    flex-shrink: 1;
    padding: .5rem;

    @at-root .dark & {
        border: 1px solid $dark-section-border;
    }
    @at-root .light & {
        border: 1px solid $light-section-border;
    }
}
.section-title {
    font-weight: bold;
    margin: .5rem 0 0 0;
    padding: .25rem 0;
}
.section-content {
    padding: 0;
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

//-------------------
// Utilities
//-------------------
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
.flex {
    display: flex;
}
.full-width {
    width: 100%;
}

$space-1: $column-gap;
$space-2: $column-gap * 2;

.m0  { margin:        0 }
.mt0 { margin-top:    0 }
.mr0 { margin-right:  0 }
.mb0 { margin-bottom: 0 }
.ml0 { margin-left:   0 }
.mx0 { margin-left:   0; margin-right:  0 }
.my0 { margin-top:    0; margin-bottom: 0 }

.m1  { margin:        $space-1 }
.mt1 { margin-top:    $space-1 }
.mr1 { margin-right:  $space-1 }
.mb1 { margin-bottom: $space-1 }
.ml1 { margin-left:   $space-1 }
.mx1 { margin-left:   $space-1; margin-right:  $space-1 }
.my1 { margin-top:    $space-1; margin-bottom: $space-1 }

.m2  { margin:        $space-2 }
.mt2 { margin-top:    $space-2 }
.mr2 { margin-right:  $space-2 }
.mb2 { margin-bottom: $space-2 }
.ml2 { margin-left:   $space-2 }
.mx2 { margin-left:   $space-2; margin-right:  $space-2 }
.my2 { margin-top:    $space-2; margin-bottom: $space-2 }

.ml-auto { margin-left: auto }
.mr-auto { margin-right: auto }
.mx-auto { margin-left: auto; margin-right: auto; }

//-------------------
// Topcoat Overrides
//-------------------
.topcoat-checkbox,
.topcoat-text-input {
    line-height: 1.5rem;
}
.topcoat-checkbox {
    display: flex;
    align-items: center;
    margin: $column-gap 0;

    &__checkmark {
        margin-right: .5rem;
    }
}
.topcoat-notification {
    min-width: 24px;
}
.topcoat-notification.error {
    bottom: 0;
    opacity: .9;
    overflow: visible;
    position: absolute;
    right: 0;
    transform: translateY(100%);
    z-index: 1;

    &::after {
        content: '\25B6';
        color: #ec514e;
        font-size: 18px;
        position: absolute;
        right: 8px;
        top: -16px;
        transform: rotateZ(-90deg);
    }
}

label {
    display: block;
    position: relative;
}
.label {
    margin-bottom: .25rem;    
}


.watcher,
.pipeline,
.action {
    border: none;
    border-bottom: 1px solid #333;
    padding: ($column-gap * 2);

    label {
        position: relative;
    }
    label:not(.topcoat-checkbox) {
        display: block;
        margin-bottom: $column-gap;
    }
    &:last-of-type {
        margin-bottom: ($column-gap * 2);
    }
}

.configurator-buttons,
.pipeline-buttons {
    margin: ($column-gap * 2) 0;

    button {
        margin-right: .5rem;
    }
}

</style>
