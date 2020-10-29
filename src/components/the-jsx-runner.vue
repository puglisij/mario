<template>
    <div class="jsx">
        <h2 class="tab-title">ExtendScript</h2>
        
        <div class="columns is-mobile is-multiline">
            <div class="column is-full scriptlistener">
                <button class="topcoat-button--large" 
                    v-if="isScriptListenerInstalled"
                    @click="toggleScriptListener" 
                    >
                    Turn ScriptListener {{ isScriptListenerActive ? 'Off' : 'On'}}
                    </button>
                <!-- <button class="topcoat-button--large" 
                    @click="toggleScriptListenerReader" 
                    >
                    ScriptListener Logs Reader {{ isScriptListenerActive ? 'Off' : 'On'}}
                    </button> -->
            </div>
            <div class="column is-full">
                <a-checkbox 
                    v-model="checkIsScriptListenerActiveOnStart" 
                    >
                    Check if ScriptListener is Active on Startup?
                </a-checkbox>
            </div>
            <div class="column is-full">
                <a-checkbox 
                    v-model="convertIdAsComment" 
                    >
                    Convert CharID to Javascript Comment? 
                </a-checkbox>
            </div>
            <label class="column is-half">
                <input 
                    class="topcoat-text-input--large full-width" 
                    type="text" 
                    maxlength="4"
                    placeholder="CharID" 
                    ref="charId" 
                    v-model="charId" 
                    @change="calculateStringId" 
                    @focus="$event.target.select()"
                    /> 
            </label>
            <label class="column is-half">
                <input 
                    class="topcoat-text-input--large full-width" 
                    type="text" 
                    placeholder="StringID" 
                    ref="stringId" 
                    v-model="stringId" 
                    @change="calculateCharId" 
                    @focus="$event.target.select()"
                    />
            </label>
        </div>
        <div class="code">
            <textarea 
                class="topcoat-textarea full-width" 
                v-model="jsxText" 
                rows="14" 
                cols="45"
                ></textarea>
            <br/><br/>
            <!-- <button class="topcoat-button--large" v-show="jsxText.length > 0" >Save as Action</button> -->
            <button 
                class="topcoat-button--large" 
                v-show="haveInput" 
                @click="runJsxText"
                >Run</button>
            <button 
                class="topcoat-button--large" 
                v-show="haveInput" 
                @click="clearJsx"
                >Clear</button>
            <button 
                class="topcoat-button--large" 
                v-show="haveInput"
                @click="clearJsxResult"
                >Clear Result</button>
        </div>
        <div class="result full-width">
            <span>Result: </span> 
            <pre>{{ jsxResult }}</pre>
        </div>
    </div>
</template>

<script>
/* npm modules */
import debounce from 'debounce'; 

/* local modules */
import host from '../host';
import store from '../store';
import hostScriptListener from '../host/hostScriptListener';
import ACheckbox from "./a-checkbox.vue";

export default {
    name: "TheJsxRunner",
    components: {
        ACheckbox
    },
    data() {
        return {
            charId: "",
            stringId: "",
            convertIdAsComment: true,  
            jsxText: "",
            jsxResult: "",
            isScriptListenerInstalled: false,
            isScriptListenerActive: false
        }
    },
    computed: {
        haveInput() {
            return this.jsxText.length > 0;
        }, 
        checkIsScriptListenerActiveOnStart: {
            get() {
                return store.general.checkIsScriptListenerActiveOnStart;
            },
            set(v) {
                store.general.checkIsScriptListenerActiveOnStart = v;
            }
        }
    },
    mounted() {
        
        if(this.checkIsScriptListenerActiveOnStart) 
        {
            console.log("Checking ScriptListenerStatus...");
            hostScriptListener.isScriptListenerActive()
            .then(isListening => {
                console.log("ScriptListener Status Active: " + isListening);
                this.isScriptListenerActive = isListening;
            });
        }
        hostScriptListener.isScriptListenerIstalled()
        .then(isInstalled => {
            console.log("ScriptListener Installed: " + isInstalled);
            this.isScriptListenerInstalled = isInstalled;
        });
    },
    methods: {
        // TODO:
        // - When ScriptListener Watcher is turned on, "Clear" button clears the file
        // - Only show "Toggle ScriptListener Watching" button when ScriptListener is installed and On
        clearJsxResult() {
            this.jsxResult = "";
        },
        clearJsx() {
            this.jsxText = "";
            this.jsxResult = "";
        },
        async runJsxText() {
            const result = await host.runJsx("" + this.jsxText);
            this.jsxResult = result.trim();
            console.log("Jsx Result:");
            console.log(result);
        },
        async toggleScriptListener() 
        {
            this.isScriptListenerActive = !this.isScriptListenerActive;
            hostScriptListener.toggleScriptListener(this.isScriptListenerActive);
        },
        async toggleScriptListenerReader()
        {
            // TODO
        },
        async calculateStringId() {
            const result = await host.convertCharToStringId(this.charId);
            this.stringId = (this.convertIdAsComment ? "// " : "") + result;
            this.$nextTick(() => {
                this.$refs.stringId.focus();
                this.$refs.stringId.select();
            });
        },
        async calculateCharId() {
            const result = await host.convertStringToCharId(this.stringId);
            this.charId = result;
            this.$nextTick(() => {
                this.$refs.charId.focus();
                this.$refs.charId.select();
            })
        }
    }
};
</script>

<style lang="scss">
    .jsx {
        label {
            margin: 0;
        }
        .code, 
        .scriptlistener {
            button {
                margin-right: .5rem;
            }
        }
        .result {
            background: rgba(0,0,0,0.2);
            margin-top: 1rem;
            padding: 1rem;
        }
    }
</style>