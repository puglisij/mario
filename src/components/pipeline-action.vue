<template>
    <div class="action">
        <span class="action-handle">&#9776;</span>
        <div class="action-data">
            <input class="topcoat-text-input" type="text" placeholder="the action string (e.g. 'action.saveDocument')"
                v-model="action.action"
            />
            <div>
                Parameters
            </div>
        </div>
        <button class="action-delete topcoat-icon-button--quiet" type="button" @click="onActionDelete(index)">X</button>
    </div>
</template>

<script>
export default {
    name: "pipeline-action",
    model: {
        prop: "action", 
        event: "changed"
    },
    props: {
        action: Object
    },
    data: () => ({
        areParametersHidden: true
    }),
    methods: {
        notifyChange() {
            this.$emit("changed");
        },
        toggleParameters() {
            this.areParametersHidden = !this.areParametersHidden;
        }
    }
}
</script>

<style scoped lang="scss">
    .action {
        align-items: flex-start;
        border-bottom: 1px solid #333;
        display: flex;
        padding: .25em;

        &:last-of-type {
            margin-bottom: .5em;
        }
    }
    .action-data {
        flex-grow: 1;
    }
    .action-handle {
        cursor: row-resize;
        margin: 0 .5em 0 0;
    }
    .action-delete {
        margin: 0 0 0 .5em;
    }
    .action-parameters {
        padding-left: 2em;
    }
</style>