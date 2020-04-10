<template>
    <div class="jsx">
        <h2>ExtendScript</h2>
        <div class="columns is-mobile">
            <div class="column is-half">
                <button class="topcoat-button--large full-width" 
                    @click="toggleScriptListener" 
                    >
                    Toggle ScriptListener {{ isScriptListening ? 'Off' : 'On'}}
                    </button>
            </div>
            <div class="column is-half">
                <button class="topcoat-button--large full-width" 
                    @click="clearScriptListener"
                    >
                    Clear ScriptListener Logs
                    </button>
            </div>
            <div class="column is-full">
                <a-checkbox 
                    v-model="convertIdAsComment" 
                    >
                    Convert to Javascript Comment? 
                </a-checkbox>
            </div>
        </div>
        <div class="columns is-mobile">
            <label class="column is-half">
                <input 
                    class="topcoat-text-input--large full-width" 
                    type="text" 
                    ref="charId" 
                    placeholder="CharID" 
                    v-model="charId" 
                    @change="calculateStringId" 
                    @focus="$event.target.select()"
                    /> 
            </label>
            <label class="column is-half">
                <input 
                    class="topcoat-text-input--large full-width" 
                    type="text" 
                    ref="stringId" 
                    placeholder="StringID" 
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
            convertIdAsComment: true,  // TODO: Get from Settings
            jsxText: "",
            jsxResult: "",
            isScriptListening: false,
            scriptWatcher: null 
        }
    },
    computed: {
        haveInput() {
            return this.jsxText.length > 0;
        }
    },
    beforeDestroy() {
        this.destroyScriptListener();
    },
    methods: {
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
            this.isScriptListening = !this.isScriptListening;
            host.toggleScriptListener(this.isScriptListening);
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
            const result = await host.convertStringToCharId(this.charId);
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
    .full-width {
        width: 100%;
    }
    .code {
        button {
            margin-right: .5rem;
        }
    }
    .result {
        background: rgba(0,0,0,0.2);
        margin-top: 1rem;
        padding: 1rem;
    }
</style>