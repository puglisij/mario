<template>
    <div class="modal-root">
        <header class="modal-header">
            Select an Action
        </header>
        <section class="modal-body">
            <select-pipeline-action-node 
                v-if="actionTree != null"
                :node="actionTree"
                :expand="true"
                @on-select="onSelect"
            />
        </section>
        <footer class="modal-footer">
            <button 
                type="button" 
                class="topcoat-button--large" 
                @click="onCancel"
            >
                Cancel
            </button>
        </footer>
    </div>
</template>

<script>
import Server from '../server';
import SelectPipelineActionNode from './select-pipeline-action-node.vue';

export default {
    name: "SelectPipelineAction",
    components: {
        SelectPipelineActionNode
    },
    data() {
        return {
            actionTree: Server.actions.getAllActions()
        }
    },
    created() {
        // TODO: Add a search feature 
        // TODO: When action hovered/clicked display action description
    },
    methods: {
        onCancel() {
            this.$emit('onClose');
        },
        onSelect(actionName) 
        {
            // TODO: Wait spinner
            Server.actions.getActionDescriptorByName(actionName)
            .then(actionDescriptor => {
                this.$emit('onSelect', actionDescriptor);
                this.$emit('onClose');
            });
        }
    }
}
</script>

<style lang="scss">
    .modal-root {
        overflow: hidden;
    }
    .tree-node {
        align-items: center;
        cursor: pointer;
        display: flex;

        &:hover {
            background: rgba(0,0,0,0.15);
        }
        i {
            font-style: normal;
            margin: 0 .25rem;
        }
        &__expand {
            align-items: center;
            display: inline-flex;
            justify-content: center;
            height: 1.5rem;
            width: 1.5rem;
        }
        &__expand i {
            font-size: 8px;
        }
        &.expanded &__expand i {
            transform: rotateZ(90deg);
        }
    }
</style>