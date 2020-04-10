

<script>
export default {
    name: "Tabs",
    props: {
        initialTab: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            activeTab: this.initialTab
        }
    },
    computed: {
        tabsList() {
            return this.$slots.default;
        }
    },
    mounted() {
        this.$on('tab-click', this.onTabClick);
    },
    methods: {
        onTabClick(tab) {
            this.activeTab = tab;
            this.$emit("changed", this.activeTab);
        },
        isActiveTab(tab) {
            return this.activeTab === tab;
        }
    },
    render: function(createElement) {
        // return a vnode (virtual dom node)
        return createElement(
            "ul",
            {
                class: "tabs"
            },
            // array of children
            this.$slots.default.map(child => {
                return createElement(
                    "li", 
                    {
                        class: "tab"
                    },
                    [child]
                )
            })
        );
    }
}
</script>

<style lang="scss" scoped>
    .tabs {
        display: flex;
        flex-shrink: 0;
        justify-items: center;
        list-style: none;
        margin: .5em auto;
        margin-right: auto;
        padding: 0;
        width: 300px;
    }
    .tab {
        flex-grow: 1;
    }
    .tab button {
        height: 1.5rem;
        width: 100%;
    }
    .tab:first-of-type button {
        border-left-width: 1px;
        border-radius: 5px 0 0 5px;
    }
    .tab:last-of-type button {
        border-radius: 0 5px 5px 0;
    }
    .dark button {
        background: $dark-button-bg-inactive;
        border: 1px solid $dark-button-border;
        border-left-width: 0;
        color: $dark-text-color;

        &.active {
            background: $dark-button-bg-active;
            color: $dark-button-text-color-active;
        }
    }
    .light button {
        background: $light-button-bg-inactive;
        border: 1px solid $light-button-border;
        border-left-width: 0;
        color: $light-text-color;

        &.active {
            background: $light-button-bg-active;
            color: $light-button-text-color-active;
        }
    }
</style>